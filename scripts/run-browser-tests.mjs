import {execFileSync, spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdirSync, appendFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, join} from 'node:path';
import {migrateDatabase} from './migrate-database.mjs';
import killProcessTree from 'tree-kill';

const repositoryDirectory = fileURLToPath(new URL('../', import.meta.url));

async function reservePort() {
  const reservation = createServer();
  await new Promise((resolve, reject) => {
    reservation.once('error', reject);
    reservation.listen(0, '127.0.0.1', resolve);
  });
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  return String(port);
}

export async function runBrowserTests(
  testArguments = [],
  {
    artifactDirectory = join(repositoryDirectory, 'browser-services'),
    runCommand = execFileSync,
    startProcess = spawn,
    applyMigrations = migrateDatabase,
    signals = process,
    browserTimeoutMilliseconds = 180000,
  } = {},
) {
  mkdirSync(artifactDirectory, {recursive: true});
  for (const name of ['browser', 'database', 'runner']) {
    writeFileSync(join(artifactDirectory, `${name}.log`), '');
  }
  const projectName = `aeki-test-${process.pid}-${Date.now()}`;
  const [databasePort, apiPort, webPort] = await Promise.all([
    reservePort(),
    reservePort(),
    reservePort(),
  ]);
  const databaseUrl = `postgresql://aeki_test:aeki_test_only@127.0.0.1:${databasePort}/aeki_test`;
  const environment = {
    ...process.env,
    TEST_DATABASE_PORT: databasePort,
    TEST_COMPOSE_PROJECT: projectName,
    DATABASE_URL: databaseUrl,
    API_HOST: '127.0.0.1',
    API_PORT: apiPort,
    BROWSER_WEB_PORT: webPort,
    VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
  };
  const composeArguments = [
    'compose',
    '-f',
    'compose.test.yaml',
    '-p',
    projectName,
  ];
  writeFileSync(
    join(artifactDirectory, 'ownership.json'),
    JSON.stringify({projectName, databasePort, apiPort, webPort}),
  );
  function preserveLog(name, content) {
    const safeContent = String(content)
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[redacted]')
      .replaceAll('aeki_test_only', '[redacted]');
    appendFileSync(join(artifactDirectory, `${name}.log`), safeContent);
  }
  function runCompose(arguments_) {
    return runCommand('docker', [...composeArguments, ...arguments_], {
      cwd: repositoryDirectory,
      env: environment,
      encoding: 'utf8',
      timeout: 120000,
    });
  }
  let browserProcess;
  let wasInterrupted = false;
  function stopBrowser() {
    wasInterrupted = true;
    if (browserProcess?.pid) killProcessTree(browserProcess.pid, 'SIGKILL');
  }
  signals.on('SIGINT', stopBrowser);
  signals.on('SIGTERM', stopBrowser);
  let deadline;
  let result = 1;
  try {
    preserveLog(
      'database',
      runCompose(['up', '--detach', '--wait', '--wait-timeout', '90']),
    );
    await applyMigrations(databaseUrl);
    if (!wasInterrupted) {
      console.log('Isolated browser stack prepared.');
      browserProcess = startProcess(
        process.execPath,
        [
          join(repositoryDirectory, 'node_modules/@playwright/test/cli.js'),
          'test',
          ...testArguments,
        ],
        {
          cwd: repositoryDirectory,
          env: environment,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      let output = '';
      browserProcess.stdout.on('data', chunk => {
        output += chunk;
      });
      browserProcess.stderr.on('data', chunk => {
        output += chunk;
      });
      browserProcess.on('error', () => {
        output += 'Browser process could not start.\n';
      });
      deadline = setTimeout(stopBrowser, browserTimeoutMilliseconds);
      const exitCode = await new Promise(resolve =>
        browserProcess.once('close', code => resolve(code ?? 1)),
      );
      preserveLog('browser', output);
      console.log(`Browser journey finished with exit code ${exitCode}.`);
      result = wasInterrupted || exitCode < 0 ? 1 : exitCode;
    }
  } catch {
    preserveLog(
      'runner',
      'Browser stack startup or execution failed. See service logs.\n',
    );
  } finally {
    clearTimeout(deadline);
    signals.off('SIGINT', stopBrowser);
    signals.off('SIGTERM', stopBrowser);
    try {
      try {
        preserveLog('database', runCompose(['logs', '--no-color', 'postgres']));
      } catch {
        preserveLog('runner', 'Database logs unavailable.\n');
      }
    } finally {
      try {
        runCompose(['down', '--volumes', '--remove-orphans']);
      } catch {
        result = 1;
        preserveLog('runner', 'Owned database cleanup failed.\n');
      }
    }
  }
  return result;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  process.exitCode = await runBrowserTests(process.argv.slice(2));
}

import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { migrateDatabase } from './migrate-database.mjs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { createServer } from 'node:net';

const repositoryDirectory = fileURLToPath(new URL('../', import.meta.url));
const testProjectName = `aeki-test-${process.pid}-${Date.now()}`;
const composeArguments = ['compose', '-f', 'compose.test.yaml', '-p', testProjectName];
function runTestCompose(commandArguments) {
  return execFileSync('docker', [...composeArguments, ...commandArguments], {
    cwd: repositoryDirectory,
    encoding: 'utf8',
  }).trim();
}

try {
  process.env.TEST_DATABASE_PORT = await new Promise((resolve, reject) => {
    const portReservation = createServer();
    portReservation.on('error', reject);
    portReservation.listen(0, '127.0.0.1', () => {
      const assignedAddress = portReservation.address();
      if (!assignedAddress || typeof assignedAddress === 'string')
        return reject(new Error('Unable to reserve test port.'));
      portReservation.close(() => resolve(String(assignedAddress.port)));
    });
  });
  runTestCompose(['up', '--detach', '--wait', '--wait-timeout', '90']);
  const publishedPort = runTestCompose(['port', 'postgres', '5432']).split(':').at(-1);
  if (!publishedPort || !/^\d+$/.test(publishedPort))
    throw new Error('Unable to determine test database port.');
  const testDatabaseUrl = `postgresql://aeki_test:aeki_test_only@127.0.0.1:${publishedPort}/aeki_test`;
  process.env.TEST_DATABASE_URL = testDatabaseUrl;
  await migrateDatabase(testDatabaseUrl);
  const require = createRequire(import.meta.url);
  const vitestPackagePath = require.resolve('vitest/package.json');
  const vitestExecutable = join(dirname(vitestPackagePath), 'vitest.mjs');
  const testExitCode = await new Promise((resolve, reject) => {
    const testProcess = spawn(
      process.execPath,
      [vitestExecutable, 'run', '--no-file-parallelism', ...process.argv.slice(2)],
      {
        cwd: fileURLToPath(new URL('../apps/api', import.meta.url)),
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: testDatabaseUrl,
          TEST_COMPOSE_PROJECT: testProjectName,
        },
      },
    );
    testProcess.on('error', reject);
    testProcess.on('exit', (exitCode) => resolve(exitCode ?? 1));
  });
  process.exitCode = testExitCode;
} finally {
  try {
    execFileSync('docker', [...composeArguments, 'unpause', 'postgres'], {
      cwd: repositoryDirectory,
      stdio: 'ignore',
    });
  } catch {
    /* Cleanup also works when no server was paused. */
  }
  runTestCompose(['down', '--volumes', '--remove-orphans']);
}

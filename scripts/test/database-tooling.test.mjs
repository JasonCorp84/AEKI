import assert from 'node:assert/strict';
import {test, afterEach} from 'node:test';
import {EventEmitter} from 'node:events';
import {spawnSync} from 'node:child_process';
import {runApiTests} from '../run-api-tests.mjs';
import {migrateDatabase} from '../migrate-database.mjs';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';

test('the public browser command uses isolated migrations and reports actual child command outcomes', () => {
  for (const [arguments_, expectedExitCode] of [
    [['--list'], 0],
    [['--project=does-not-exist'], 1],
  ]) {
    const result = spawnSync(
      process.execPath,
      [resolve('../../scripts/run-browser-tests.mjs'), ...arguments_],
      {
        cwd: resolve('../..'),
        encoding: 'utf8',
        timeout: 150000,
      },
    );
    assert.equal(
      result.status,
      expectedExitCode,
      result.stdout + result.stderr,
    );
    const ownership = JSON.parse(
      readFileSync(resolve('../../browser-services/ownership.json'), 'utf8'),
    );
    for (const arguments_ of [
      [
        'ps',
        '--all',
        '--quiet',
        '--filter',
        `label=com.docker.compose.project=${ownership.projectName}`,
      ],
      [
        'volume',
        'ls',
        '--quiet',
        '--filter',
        `label=com.docker.compose.project=${ownership.projectName}`,
      ],
    ]) {
      const remainingResources = spawnSync('docker', arguments_, {
        encoding: 'utf8',
        timeout: 10000,
      });
      assert.equal(remainingResources.status, 0, remainingResources.stderr);
      assert.equal(
        remainingResources.stdout.trim(),
        '',
        'The browser command must remove only its owned resources.',
      );
    }
  }
  const log = readFileSync(
    resolve('../../browser-services/browser.log'),
    'utf8',
  );
  assert.match(log, /does-not-exist/);
  assert.doesNotMatch(log, /aeki_test_only|postgresql:\/\//);
});

const originalTestDatabaseUrl = process.env.TEST_DATABASE_URL;
afterEach(() => {
  process.env.TEST_DATABASE_URL = originalTestDatabaseUrl;
});

function processBoundary(overrides = {}) {
  return {
    runCommand: (_command, argumentsList) => {
      if (argumentsList.includes('port'))
        return `127.0.0.1:${new URL(originalTestDatabaseUrl).port}`;
      if (argumentsList.includes('unpause'))
        throw new Error('No paused test server');
      return '';
    },
    startProcess: () => {
      const processEvents = new EventEmitter();
      queueMicrotask(() => processEvents.emit('exit', 0));
      return processEvents;
    },
    ...overrides,
  };
}

test('reports unusable OS port reservations and still attempts owned cleanup', async () => {
  for (const assignedAddress of [null, 'socket-file']) {
    const portServer = {
      on() {},
      listen(_port, _host, ready) {
        ready();
      },
      address: () => assignedAddress,
    };
    await assert.rejects(
      runApiTests([], processBoundary({createPortServer: () => portServer})),
      /Unable to reserve test port/,
    );
  }
});

test('rejects an invalid published Docker port', async () => {
  for (const publishedPort of ['', '127.0.0.1:invalid'])
    await assert.rejects(
      runApiTests([], processBoundary({runCommand: () => publishedPort})),
      /Unable to determine test database port/,
    );
});

test('turns a failed test subprocess into failure and preserves launch diagnostics', async () => {
  const boundary = (event, value) =>
    processBoundary({
      startProcess: () => {
        const processEvents = new EventEmitter();
        queueMicrotask(() => processEvents.emit(event, value));
        return processEvents;
      },
    });
  assert.equal(await runApiTests([], boundary('exit', null)), 1);
  await assert.rejects(
    runApiTests(
      [],
      boundary('error', new Error('Unable to launch test process')),
    ),
    /Unable to launch test process/,
  );
  assert.equal(await runApiTests(undefined, processBoundary()), 0);
});

test('rejects non-PostgreSQL URLs and rollback outside the isolated test database', async () => {
  await assert.rejects(
    migrateDatabase('https://user:secret@localhost/database'),
    /PostgreSQL/,
  );
  await assert.rejects(
    migrateDatabase('postgresql://user:secret@localhost/production', 'down'),
    /Rollback is restricted/,
  );
  process.env.TEST_DATABASE_URL =
    'postgresql://user:secret@localhost/production';
  await assert.rejects(
    migrateDatabase(process.env.TEST_DATABASE_URL, 'down'),
    /Rollback is restricted/,
  );
});

test('migration CLI sanitizes invalid configuration and succeeds against the actual database', () => {
  const environment = {...process.env};
  delete environment.DATABASE_URL;
  for (const configuration of [
    environment,
    {...environment, DATABASE_URL: 'https://user:secret@localhost/database'},
  ]) {
    const failed = spawnSync(
      process.execPath,
      ['../../scripts/migrate-database.mjs'],
      {
        env: configuration,
        encoding: 'utf8',
      },
    );
    assert.equal(failed.status, 1);
    assert.match(failed.stderr, /Database migration failed/);
    assert.doesNotMatch(failed.stderr, /secret/);
  }
  const passed = spawnSync(
    process.execPath,
    ['../../scripts/migrate-database.mjs'],
    {
      env: process.env,
      encoding: 'utf8',
    },
  );
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /Database migrations applied/);
});

test('suppresses sensitive SDK logging at every severity', async context => {
  const leakedMessages = [];
  for (const method of ['log', 'warn', 'error'])
    context.mock.method(console, method, message =>
      leakedMessages.push(message),
    );
  const result = await migrateDatabase(
    originalTestDatabaseUrl,
    'up',
    async options => {
      for (const severity of ['info', 'warn', 'error'])
        options.logger[severity]('secret-password');
      return [];
    },
  );
  assert.deepEqual(result, []);
  assert.deepEqual(leakedMessages, []);
});

test('rolls back and restores only the actual owned isolated test database', async () => {
  assert.equal(
    (await migrateDatabase(originalTestDatabaseUrl, 'down')).length,
    1,
  );
  assert.equal((await migrateDatabase(originalTestDatabaseUrl)).length, 1);
});

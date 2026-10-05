import {afterEach, expect, it} from 'vitest';
import {Test} from '@nestjs/testing';
import {parseHealthResponse, parseReadinessResponse} from '@aeki/contracts';
import {AppModule} from '../dist/app.module.js';
import {runTestDatabaseCommand} from './postgres-fixture.mjs';
import {spawnSync} from 'node:child_process';
let apiApplication;
afterEach(async () => {
  runTestDatabaseCommand('start');
  await apiApplication?.close();
  apiApplication = undefined;
});

it('keeps liveness while PostgreSQL is stopped, returns contracted 503 and recovers', async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  apiApplication = testingModule.createNestApplication();
  await apiApplication.listen(0, '127.0.0.1');
  const apiUrl = await apiApplication.getUrl();
  await fetch(`${apiUrl}/readiness`);
  runTestDatabaseCommand('stop');
  const readinessHttpResponse = await fetch(`${apiUrl}/readiness`);
  expect(readinessHttpResponse.status).toBe(503);
  expect(parseReadinessResponse(await readinessHttpResponse.json())).toEqual({
    status: 'not_ready',
    database: 'unreachable',
    code: 'DATABASE_UNAVAILABLE',
  });
  expect((await fetch(`${apiUrl}/health`)).status).toBe(200);
  runTestDatabaseCommand('start');
  const recoveredResponse = await fetch(`${apiUrl}/readiness`);
  expect(recoveredResponse.status).toBe(200);
}, 15000);

it.each([undefined, 'https://secret-user:secret-password@host/database'])(
  'fails startup with actionable sanitized database configuration feedback: %s',
  databaseUrl => {
    const startupEnvironment = {...process.env};
    if (databaseUrl === undefined) delete startupEnvironment.DATABASE_URL;
    else startupEnvironment.DATABASE_URL = databaseUrl;
    const startup = spawnSync(process.execPath, ['dist/main.js'], {
      env: startupEnvironment,
      encoding: 'utf8',
      timeout: 5000,
    });
    expect(startup.status).toBe(1);
    const feedback = startup.stdout + startup.stderr;
    expect(feedback).toContain('DATABASE_URL');
    expect(feedback).not.toContain('secret-password');
  },
);
it('reports API liveness through the actual HTTP boundary', async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  apiApplication = testingModule.createNestApplication();
  await apiApplication.listen(0, '127.0.0.1');
  const healthHttpResponse = await fetch(
    `${await apiApplication.getUrl()}/health`,
  );
  expect(healthHttpResponse.status).toBe(200);
  expect(parseHealthResponse(await healthHttpResponse.json())).toEqual({
    status: 'ok',
    service: 'aeki-api',
  });
});

it('reports database readiness through an actual Nest HTTP response', async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  apiApplication = testingModule.createNestApplication();
  await apiApplication.listen(0, '127.0.0.1');
  const readinessHttpResponse = await fetch(
    `${await apiApplication.getUrl()}/readiness`,
  );
  expect(readinessHttpResponse.status).toBe(200);
  expect(parseReadinessResponse(await readinessHttpResponse.json())).toEqual({
    status: 'ready',
    database: 'reachable',
  });
});

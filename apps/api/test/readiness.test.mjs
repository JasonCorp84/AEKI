import { afterEach, expect, it } from 'vitest';
import { PostgresReadinessAdapter } from '../dist/database/postgres-readiness.adapter.js';
import {
  runTestDatabaseCommand,
  resumeTestDatabase,
  testDatabaseUrl,
} from './postgres-fixture.mjs';

let databaseProbe;
afterEach(async () => {
  resumeTestDatabase();
  await databaseProbe?.onModuleDestroy();
});

it('reports ready only after a query against actual PostgreSQL succeeds', async () => {
  databaseProbe = new PostgresReadinessAdapter(testDatabaseUrl);
  expect(await databaseProbe.checkReadiness()).toEqual({ status: 'ready', database: 'reachable' });
});

it('times out a nonresponding real PostgreSQL connection within budget and recovers', async () => {
  databaseProbe = new PostgresReadinessAdapter(testDatabaseUrl);
  await databaseProbe.checkReadiness();
  runTestDatabaseCommand('pause');
  const checkStartedAt = performance.now();
  const readinessResult = await databaseProbe.checkReadiness();
  expect(readinessResult).toEqual({
    status: 'not_ready',
    database: 'unreachable',
    code: 'DATABASE_TIMEOUT',
  });
  expect(performance.now() - checkStartedAt).toBeLessThan(2500);
  runTestDatabaseCommand('unpause');
  expect(await databaseProbe.checkReadiness()).toEqual({ status: 'ready', database: 'reachable' });
  await databaseProbe.onModuleDestroy();
  databaseProbe = undefined;
}, 5000);

it('reports an unavailable database without leaking connection diagnostics', async () => {
  const unavailableDatabaseUrl = new URL(testDatabaseUrl);
  unavailableDatabaseUrl.port = '1';
  databaseProbe = new PostgresReadinessAdapter(unavailableDatabaseUrl.href);
  expect(await databaseProbe.checkReadiness()).toEqual({
    status: 'not_ready',
    database: 'unreachable',
    code: 'DATABASE_UNAVAILABLE',
  });
});

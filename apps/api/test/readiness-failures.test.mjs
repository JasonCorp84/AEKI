import {afterEach, expect, it, vi} from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
  vi.doUnmock('pg');
});

async function createProbeWithDatabaseFault(databaseBehavior) {
  // pg is the external database SDK boundary; real PostgreSQL tests run alongside these fault cases.
  vi.doMock('pg', () => ({
    Pool: class {
      on(_event, handler) {
        databaseBehavior.onIdleFailure = handler;
      }
      connect() {
        return databaseBehavior.connect();
      }
      async end() {
        databaseBehavior.closed = true;
      }
    },
  }));
  const {PostgresReadinessAdapter} =
    await import('../dist/database/postgres-readiness.adapter.js');
  return new PostgresReadinessAdapter(
    'postgresql://test:test@localhost/aeki_test',
  );
}

it.each([
  new Error('Connection refused'),
  'Connection refused',
  new Error('Query timeout'),
])(
  'maps a database SDK failure to contracted readiness and releases acquired resources: %s',
  async databaseFailure => {
    let hasBeenReleased = false;
    const behavior = {
      connect: async () => ({
        query: async () => {
          throw databaseFailure;
        },
        release: () => {
          if (hasBeenReleased) throw new Error('Client released twice');
          hasBeenReleased = true;
        },
      }),
    };
    const probe = await createProbeWithDatabaseFault(behavior);
    expect(await probe.checkReadiness()).toEqual({
      status: 'not_ready',
      database: 'unreachable',
      code:
        databaseFailure instanceof Error &&
        databaseFailure.message.includes('timeout')
          ? 'DATABASE_TIMEOUT'
          : 'DATABASE_UNAVAILABLE',
    });
    expect(hasBeenReleased).toBe(true);
    await probe.onModuleDestroy();
    expect(behavior.closed).toBe(true);
  },
);

it('destroys a hung query and releases a connection acquired after the probe deadline', async () => {
  vi.useFakeTimers();
  let deliverConnection;
  let connectionDestroyed = false;
  const behavior = {
    connect: () =>
      new Promise(resolve => {
        deliverConnection = resolve;
      }),
  };
  const probe = await createProbeWithDatabaseFault(behavior);
  const readiness = probe.checkReadiness();
  await vi.advanceTimersByTimeAsync(2000);
  expect(await readiness).toEqual({
    status: 'not_ready',
    database: 'unreachable',
    code: 'DATABASE_TIMEOUT',
  });
  deliverConnection({
    release: destroy => {
      connectionDestroyed = destroy;
    },
    query: async () => {
      throw new Error('Late connection must never run a query');
    },
  });
  await Promise.resolve();
  expect(connectionDestroyed).toBe(true);
  await probe.onModuleDestroy();
});

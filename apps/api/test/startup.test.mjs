import {afterEach, expect, it, vi} from 'vitest';
import {requireDatabaseUrl} from '../dist/database/database-configuration.js';
import {createServer} from 'node:net';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
  process.exitCode = undefined;
  vi.doUnmock('@nestjs/core');
});

it.each([
  undefined,
  'not a URL',
  'https://user:pass@localhost/database',
  'postgresql://localhost/database',
  'postgresql://user@localhost/database',
  'postgresql://user:pass@localhost/',
])(
  'rejects incomplete database configuration without exposing credentials: %s',
  databaseUrl =>
    expect(() => requireDatabaseUrl(databaseUrl)).toThrow(/DATABASE_URL/),
);

it.each(['0', '65536', 'abc', '1.5'])(
  'rejects an invalid API port before starting a server: %s',
  async port => {
    vi.stubEnv('API_PORT', port);
    const feedback = vi.spyOn(console, 'error').mockImplementation(() => {});
    await import('../dist/main.js');
    await vi.waitFor(
      () =>
        expect(feedback).toHaveBeenCalledWith(
          'API_PORT must be an integer from 1 to 65535.',
        ),
      {timeout: 10000},
    );
    expect(process.exitCode).toBe(1);
  },
);

it('rejects an empty API host with actionable startup feedback', async () => {
  vi.stubEnv('API_PORT', '3000');
  vi.stubEnv('API_HOST', ' ');
  const feedback = vi.spyOn(console, 'error').mockImplementation(() => {});
  await import('../dist/main.js');
  await vi.waitFor(
    () => expect(feedback).toHaveBeenCalledWith('API_HOST must not be empty.'),
    {
      timeout: 10000,
    },
  );
});

it.each([new Error('Framework startup failed'), 'unexpected failure'])(
  'handles framework startup failure through the real entrypoint: %s',
  async frameworkFailure => {
    vi.stubEnv('API_PORT', undefined);
    vi.stubEnv('API_HOST', undefined);
    vi.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: async () => {
          throw frameworkFailure;
        },
      },
    }));
    const feedback = vi.spyOn(console, 'error').mockImplementation(() => {});
    await import('../dist/main.js');
    await vi.waitFor(
      () =>
        expect(feedback).toHaveBeenCalledWith(
          frameworkFailure instanceof Error
            ? 'Framework startup failed'
            : 'Unable to start API.',
        ),
      {timeout: 10000},
    );
    expect(process.exitCode).toBe(1);
  },
);

it('starts the actual Nest HTTP application from its production entrypoint', async () => {
  const portReservation = createServer();
  await new Promise(resolve => portReservation.listen(0, '127.0.0.1', resolve));
  const apiPort = portReservation.address().port;
  await new Promise(resolve => portReservation.close(resolve));
  vi.stubEnv('API_PORT', String(apiPort));
  vi.stubEnv('API_HOST', '127.0.0.1');
  const {NestFactory} = await import('@nestjs/core');
  let application;
  const createApplication = NestFactory.create.bind(NestFactory);
  vi.spyOn(NestFactory, 'create').mockImplementation(
    async (...argumentsList) => {
      application = await createApplication(...argumentsList);
      return application;
    },
  );
  try {
    await import('../dist/main.js');
    await vi.waitFor(
      async () => {
        const response = await fetch(`http://127.0.0.1:${apiPort}/health`);
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
          status: 'ok',
          service: 'aeki-api',
        });
      },
      {timeout: 10000},
    );
  } finally {
    await application?.close();
  }
});

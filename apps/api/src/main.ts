import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module.js';

async function startApiApplication(): Promise<void> {
  const configuredApiPort = process.env['API_PORT'] ?? '3000';

  if (
    !/^\d+$/.test(configuredApiPort) ||
    Number(configuredApiPort) < 1 ||
    Number(configuredApiPort) > 65535
  ) {
    throw new Error('API_PORT must be an integer from 1 to 65535.');
  }

  const apiHost = process.env['API_HOST'] ?? '127.0.0.1';

  if (!apiHost.trim()) {
    throw new Error('API_HOST must not be empty.');
  }

  const apiApplication = await NestFactory.create(AppModule, {
    abortOnError: false,
  });

  apiApplication.enableShutdownHooks();
  await apiApplication.listen(Number(configuredApiPort), apiHost);
}

startApiApplication().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Unable to start API.',
  );
  process.exitCode = 1;
});

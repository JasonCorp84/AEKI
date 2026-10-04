import { runner } from 'node-pg-migrate';
import { fileURLToPath } from 'node:url';

export async function migrateDatabase(databaseUrl, direction = 'up', migrationRunner = runner) {
  const parsedUrl = new URL(databaseUrl);
  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL.');
  }
  if (
    direction === 'down' &&
    (databaseUrl !== process.env.TEST_DATABASE_URL || parsedUrl.pathname !== '/aeki_test')
  ) {
    throw new Error('Rollback is restricted to the owned isolated test database.');
  }
  return migrationRunner({
    databaseUrl,
    dir: fileURLToPath(new URL('../migrations', import.meta.url)),
    direction,
    migrationsTable: 'aeki_migrations',
    count: direction === 'down' ? 1 : Infinity,
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    if (!process.env.DATABASE_URL)
      throw new Error('DATABASE_URL is required. Copy .env.example to .env.');
    await migrateDatabase(process.env.DATABASE_URL);
    console.log('Database migrations applied.');
  } catch {
    console.error(
      'Database migration failed. Check DATABASE_URL and database availability; credentials are not printed.',
    );
    process.exitCode = 1;
  }
}

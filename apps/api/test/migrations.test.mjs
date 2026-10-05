import {expect, it} from 'vitest';
import {Pool} from 'pg';
import {migrateDatabase} from '../../../scripts/migrate-database.mjs';
import {testDatabaseUrl} from './postgres-fixture.mjs';

it('initializes a disposable foundation schema, applies idempotently and rolls back/reapplies', async () => {
  const migrationConnection = new Pool({connectionString: testDatabaseUrl});
  try {
    expect(await migrateDatabase(testDatabaseUrl)).toHaveLength(0);
    const schemaExists = await migrationConnection.query(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'aeki_foundation'",
    );
    expect(schemaExists.rows).toEqual([{schema_name: 'aeki_foundation'}]);
    expect(await migrateDatabase(testDatabaseUrl, 'down')).toHaveLength(1);
    expect(await migrateDatabase(testDatabaseUrl)).toHaveLength(1);
  } finally {
    await migrationConnection.end();
  }
});

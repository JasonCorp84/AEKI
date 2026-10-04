import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';
import { ReadinessController } from './health/readiness.controller.js';
import { PostgresReadinessAdapter } from './database/postgres-readiness.adapter.js';
import { requireDatabaseUrl } from './database/database-configuration.js';
import { databaseReadinessToken } from './database/readiness-probe.js';

@Module({
  controllers: [HealthController, ReadinessController],
  providers: [
    {
      provide: databaseReadinessToken,
      useFactory: () =>
        new PostgresReadinessAdapter(requireDatabaseUrl(process.env['DATABASE_URL'])),
    },
  ],
})
export class AppModule {}

import type {ReadinessResponse} from '@aeki/contracts';
import {Pool, type PoolClient} from 'pg';
import type {DatabaseReadinessProbe} from './readiness-probe.js';

const databaseProbeBudgetMillis = 2000;
class DatabaseProbeTimeout extends Error {}

export class PostgresReadinessAdapter implements DatabaseReadinessProbe {
  private readonly connectionPool: Pool;

  constructor(databaseUrl: string) {
    this.connectionPool = new Pool({
      connectionString: databaseUrl,
      max: 2,
      connectionTimeoutMillis: databaseProbeBudgetMillis,
      query_timeout: databaseProbeBudgetMillis,
      statement_timeout: databaseProbeBudgetMillis,
    });
    // pg removes the failed idle client; handle the event so an outage does not kill liveness.
    this.connectionPool.on('error', () => {});
  }

  async checkReadiness(): Promise<ReadinessResponse> {
    let checkedOutClient: PoolClient | undefined;
    let hasDeadlineExpired = false;
    let shouldDestroyClient = false;
    let deadlineTimer: ReturnType<typeof setTimeout> | undefined;

    const connectivityQuery = (async () => {
      const acquiredClient = await this.connectionPool.connect();
      if (hasDeadlineExpired) {
        acquiredClient.release(true);
        return;
      }
      checkedOutClient = acquiredClient;
      await acquiredClient.query('SELECT 1');
    })();

    const probeDeadline = new Promise<never>((_resolve, reject) => {
      deadlineTimer = setTimeout(() => {
        hasDeadlineExpired = true;
        // Destroy the socket, rather than just abandoning an in-flight query.
        checkedOutClient?.release(true);
        checkedOutClient = undefined;
        reject(new DatabaseProbeTimeout());
      }, databaseProbeBudgetMillis);
    });

    try {
      await Promise.race([connectivityQuery, probeDeadline]);
      return {status: 'ready', database: 'reachable'};
    } catch (error: unknown) {
      shouldDestroyClient = true;
      const hasTimedOut =
        hasDeadlineExpired ||
        error instanceof DatabaseProbeTimeout ||
        (error instanceof Error && /timeout/i.test(error.message));
      return {
        status: 'not_ready',
        database: 'unreachable',
        code: hasTimedOut ? 'DATABASE_TIMEOUT' : 'DATABASE_UNAVAILABLE',
      };
    } finally {
      clearTimeout(deadlineTimer);
      checkedOutClient?.release(shouldDestroyClient);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.connectionPool.end();
  }
}

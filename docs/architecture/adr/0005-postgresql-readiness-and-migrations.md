# ADR-0005: PostgreSQL Readiness and Isolated Migrations

Date: 2026-10-02. Status: adopted for issue #2 after explicit Mikado-plan approval; runtime guarantees require the recorded integration evidence.

Use `pg` 8.23.1, `@types/pg` 8.23.1, `node-pg-migrate` 9.0.0 and PostgreSQL `17.9-bookworm`. Registry engines accept the pinned Node 24 runtime; ESM builds and actual migration execution verify compatibility. Pin exact npm versions/lockfile and the database image tag. The tag pins the PostgreSQL release, not an immutable image digest.

Use a small database-readiness adapter with a managed pg pool, a two-second total probe deadline and explicit release/destruction. On shutdown end the pool. Catch background pool errors without surfacing raw driver diagnostics. Keep `/health` independent; `/readiness` returns contracted 200/503 results. This checks connectivity only, not schema completion or write permissions. Missing/invalid DATABASE_URL fails startup; an unavailable configured database does not prevent the API from starting.

Compose dev storage persists by default. API tests create a uniquely named Compose project with a separate role/database, a per-run named volume and a reserved random loopback port. The volume and port survive the outage test's stop/start; final teardown removes only that owned project and volume. A tmpfs experiment lost migration history across restart and was replaced. Migrations create only a foundation schema and their version history. Down migrations in tooling are restricted to the owned isolated test URL.

Verified on 2026-10-03: real PostgreSQL success/refusal/paused-query timeout/recovery, Nest HTTP outage with unchanged liveness, migration reapply/rollback and pool shutdown. The full suite has 40 passing tests and an independently installed candidate passed the same checks. Actual browser outage/recovery is recorded in the [implementation session](../../engineering/sessions/2026-10-03-postgresql-readiness-implementation.md). The image release tag is not an immutable digest, and connectivity does not establish product readiness.

Direct SQL and a dedicated migration runner expose lifecycle and failure behavior without premature ORM/product modeling. Compared with Prisma/Drizzle, this is less upfront machinery, with explicit connection/error/row-mapping responsibility. Revisit for product persistence, migration concurrency, nonlocal credentials, production deployment or timeout/isolation failures. Do not adopt an ORM merely to return liveness/readiness.

References: [pg Pool lifecycle](https://node-postgres.com/apis/pool), [node-pg-migrate](https://salsita.github.io/node-pg-migrate/), [Compose startup ordering](https://docs.docker.com/compose/how-tos/startup-order/).

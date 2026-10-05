# AEKI

AEKI is a product discovery and stock-reservation practice application using synthetic data. Its implemented foundation is a React → HTTP → NestJS → PostgreSQL journey with separate API liveness and database readiness. Product search remains later scope.

## Quick start

Use **Node 24.18.1** and **npm 11.16.0**, recorded in `.node-version`, `.nvmrc` and the manifests. Start Docker with Compose support before database commands or API tests.

```sh
npm ci
cp .env.example .env
npm run db:up
npm run db:migrate
npm run dev
```

In PowerShell, use `Copy-Item .env.example .env` for the copy step. Preserve an existing `.env` and add missing variables instead of overwriting it.

Open **http://127.0.0.1:5173/**. Nest serves **http://127.0.0.1:3000/health** and `/readiness`. Vite proxies `/api/` to Nest; the browser uses the real RTK Query client. No mock server or fallback runs in the application.

`DATABASE_URL` is required. Missing or malformed configuration fails API startup with a sanitized, actionable message. A valid URL pointing at an unavailable database allows startup and yields not-ready. If changing the API port, also update `VITE_API_PROXY_TARGET`. `VITE_*` values become public browser configuration: never put secrets in them. Example database credentials are disposable local development values.

Development PostgreSQL listens only on `127.0.0.1:55432`. `npm run db:down` removes its container/network and preserves its named data volume. The migration creates only `aeki_foundation` and migration history; no product model is introduced. Reapplying it does not duplicate work. Tooling permits rollback only against the explicitly provided isolated test URL.

Independent development commands (use separate terminals):

```sh
npm run dev -w @aeki/api
npm run dev -w @aeki/web
```

Each app builds independently and prepares its shared contract dependency:

```sh
npm run build -w @aeki/api
npm run build -w @aeki/web
```

After the API build, `npm run start -w @aeki/api` runs compiled output. Dev commands watch source changes. After changing OpenAPI, regenerate and rebuild the contracts. Stop development commands with Ctrl+C and confirm their child processes exited before restarting on the same ports.

## Checks and contracts

Formatting and linting use the existing [Google TypeScript Style (`gts`)](https://github.com/google/gts) preset, without handwritten style rules. The root Prettier configuration directly references `gts/.prettierrc.json`; ESLint imports the shared Google configuration. `npm run format` applies native ESLint fixes and then native Prettier across the supported project scope:

```sh
npm run format
npm run format:check
```

The formatting check runs first in `npm run check`. Editor integrations use `.prettierrc.json` and `.editorconfig`; select Prettier as the formatter in your editor and use ESLint's fix action for lint fixes. Generated TypeScript contracts are formatted by the same Prettier API during generation, so regenerated output remains reproducible. Lockfiles, build/dependency output, local environment files, ignored teaching materials and rendered diagram exports are excluded. CSV and SQL have no built-in Prettier parser; their data/migration syntax is preserved. Embedded formatting follows the shared preset. Prettier preserves existing blank lines; the preset does not promise to invent semantic paragraph breaks. See [ADR-0007](docs/architecture/adr/0007-google-typescript-style.md).

```sh
npm run check
npm run contracts:generate
npm run contracts:check
npm run verify:clean
npm run test:measurements
npm run measurements:check
npm run test:coverage
npm run coverage:check
```

`check` validates OpenAPI/generated-file consistency, lints, type-checks, runs contract/API/frontend/tooling tests with file-level 100% coverage and builds both apps. Generation updates transport types and runtime health/readiness schemas from the single OpenAPI source. Generated files are versioned and never edited by hand.

`npm ci` installs the Husky hooks. Before a commit, lint-staged applies the Google ESLint fixes and Prettier to staged JS/TS files, and native Prettier to other supported files. These file groups do not overlap, and unstaged edits are preserved. Before every push, `format:check` checks the whole supported project scope and blocks on unformatted files. Run `npm run format`, review the changes and commit them before retrying a blocked push.

GitHub Actions runs the same `check` command on every push and pull request. `main` requires a pull request and a successful, up-to-date `Quality gate`, including for administrators. CI uses pinned official actions and uploads coverage evidence for 14 days. AWS deployment remains later scope.

Coverage must be 100% for lines, statements, functions and branches **in each executable handwritten application/tooling file**. A missing file/report or any uncovered counter fails; rounded percentages cannot hide gaps. The archived prototype, tests/fixtures, generated code, configuration-only files and type-only declarations are excluded from coverage. The prototype remains formatted. SQL migrations receive real PostgreSQL apply/rollback/reapply tests. Reports are in `coverage/{web,api,contracts,processes}/`; `coverage:check` validates reports from a completed `test:coverage` run, rather than running tests itself. See [ADR-0006](docs/architecture/adr/0006-ci-formatting-and-complete-coverage.md) for the agreed scope and collection strategy.

It also validates the engineering measurement CSV; `npm test` includes its dedicated tests. See [measurement validation and reconciliation](docs/engineering/measurement-validation.md) for mandatory new-record fields, historical warnings and how to recover actual turn timing without guessing.

API tests automatically start a uniquely named PostgreSQL Compose project, apply migrations, run against its separate test role/database and remove its container, network and owned volume in cleanup. Its random loopback port remains fixed across stop/start within the run. Tests never use the development `DATABASE_URL`. They require a running Docker engine and the pinned image (downloaded on first use).

`verify:clean` archives a candidate Git tree into a new temporary directory, runs independent `npm ci` / `npm run check`, and prints its retained location. It includes current non-ignored changes without modifying the actual index or creating a commit. Until these changes are committed/pushed, this is a clean candidate snapshot, not a GitHub checkout. A published fresh checkout uses the same install/check commands.

Tests observe parser acceptance/rejection, actual PostgreSQL and Nest HTTP (including outage, bounded nonresponse, migration rollback/reapply and startup validation), and UI/store/RTK Query cooperation with MSW at the network seam. MSW is test-only. The real connected browser/API/database journey is additionally checked through browser automation; no committed automated E2E suite is claimed. See [issue #2 implementation evidence](docs/engineering/sessions/2026-10-03-postgresql-readiness-implementation.md) and [issue #1 evidence](docs/engineering/sessions/2026-10-01-foundation-health-implementation.md).

## Failure and recovery

1. Start API and web in separate terminals. Observe loading followed by **API reachable**.
2. Stop the API; click **Check again**. The page shows **API unreachable**.
3. Restart the API; click **Retry connection**. The page returns to **API reachable**.

HTTP requests time out after three seconds. A successful HTTP response with invalid JSON or invalid health data shows **Invalid API response**. Rechecking starts a new loading state; failed refreshes do not keep the previous success visible.

For database outage/recovery, run `docker compose stop postgres`, click **Check database again**, and independently click **Check again** for API liveness. The API remains reachable while the database shows **Database not ready**. Run `npm run db:up`, then **Retry database check** to restore **Database ready**. This stop preserves development data.

GET `/readiness` returns a schema-valid 200 ready result or 503 not-ready result with `DATABASE_UNAVAILABLE` / `DATABASE_TIMEOUT`. The real connectivity query has a two-second total deadline, below the browser's three-second timeout. A schema-valid 503 is an application result. Invalid JSON, incompatible status/body and request failure have separate UI feedback. Connectivity does not prove schema completeness, write permission or product correctness.

The frontend separates composition/store, feature transport, connected state selection and presentation. Text comes from typed message contracts; styling uses semantic tokens. Full theme/locale switching remains later scope. The current visual direction is A; [the standalone prototypes](apps/web/prototype/README.md) remain exploration evidence. This slice needs local PostgreSQL; AWS and production credentials remain outside scope.

## Project documentation

- [Requirements](docs/planning/AEKI-product-search-app-requirements.hu.md).
- [Architecture and folder structure](docs/architecture/folder-structure-proposal.hu.md).
- [Engineering principles](docs/architecture/engineering-principles.hu.md).
- [C4 System Context](docs/architecture/01-system-context.md).
- [C4 Container](docs/architecture/02-containers.md).
- [C4 Component – backend data flow](docs/architecture/03-components.md).
- [C4 Component – implemented foundation](docs/architecture/03-foundation-components.md).
- [AI-assisted engineering measurement log](docs/engineering/ai-assisted-engineering-log.md).
- [React UI implementation plan](docs/planning/react-ui-implementation-plan.md).
- [ADR-0003: frontend theme and localization boundaries (proposed)](docs/architecture/adr/0003-frontend-theme-and-localization.md).
- [ADR-0001: engineering principles](docs/architecture/adr/0001-engineering-principles.hu.md).
- [ADR-0002: integration and E2E testing](docs/architecture/adr/0002-integration-and-e2e-testing.hu.md).
- [ADR-0004: foundation toolchain and health contract](docs/architecture/adr/0004-foundation-toolchain-and-health-contract.md).
- [Published issues](docs/planning/github-implementation-issues.md).
- [Issue #1 Mikado plan](docs/planning/issue-1-mikado-plan.md).
- [Issue #2 Mikado plan and implementation evidence](docs/planning/issue-2-mikado-plan.md).
- [ADR-0005: PostgreSQL readiness and migrations](docs/architecture/adr/0005-postgresql-readiness-and-migrations.md).
- [ADR-0006: CI, formatting and complete coverage](docs/architecture/adr/0006-ci-formatting-and-complete-coverage.md).

Accepted principles: SOLID, TDD, TypeScript contracts with runtime validation, OpenAPI, ADR and C4; meaningful integration and critical end-to-end verification accompany unit tests.

GitHub tracks this AEKI delivery under Csaba's explicit instruction. Cross-project priorities and AI-assisted methodology remain in Linear. Documentation is English; older source documents retain historical filenames. Personal learning notes remain outside this repository.

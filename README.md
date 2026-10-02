# AEKI

AEKI is a product discovery and stock-reservation practice application using synthetic data. Its implemented foundation is a React → HTTP → NestJS health journey. Product search and database readiness are later tickets; this health report establishes API liveness only.

## Quick start

Use **Node 24.18.1** and **npm 11.16.0**, recorded in `.node-version`, `.nvmrc` and the manifests.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. Nest serves **http://127.0.0.1:3000/health**. Vite proxies `/api/health` to Nest; the browser uses the real RTK Query client. No mock server or fallback runs in the application.

Defaults work without configuration. Copy `.env.example` to `.env` for overrides. If changing the API port, also update `VITE_API_PROXY_TARGET`. `VITE_*` values become public browser configuration: never put secrets in them.

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

```sh
npm run check
npm run contracts:generate
npm run contracts:check
npm run verify:clean
```

`check` validates OpenAPI/generated-file consistency, lints, type-checks, runs contract/API/frontend tests and builds both apps. Generation updates transport types and the runtime health schema from the single OpenAPI source. Generated files are versioned and never edited by hand.

`verify:clean` archives a candidate Git tree into a new temporary directory, runs independent `npm ci` / `npm run check`, and prints its retained location. It includes current non-ignored changes without modifying the actual index or creating a commit. Until these changes are committed/pushed, this is a clean candidate snapshot, not a GitHub checkout. A published fresh checkout uses the same install/check commands.

Tests observe parser acceptance/rejection, actual Nest HTTP, and UI/store/RTK Query cooperation with MSW at the network seam. MSW is test-only. The real connected browser/API journey is additionally checked manually; no automated Playwright suite is claimed. See [implementation evidence](docs/engineering/sessions/2026-10-01-foundation-health-implementation.md).

## Failure and recovery

1. Start API and web in separate terminals. Observe loading followed by **API reachable**.
2. Stop the API; click **Check again**. The page shows **API unreachable**.
3. Restart the API; click **Retry connection**. The page returns to **API reachable**.

HTTP requests time out after three seconds. A successful HTTP response with invalid JSON or invalid health data shows **Invalid API response**. Rechecking starts a new loading state; failed refreshes do not keep the previous success visible.

The frontend separates composition/store, feature transport and presentation. Text comes from a typed message contract; styling uses semantic tokens. Full theme/locale switching remains later scope. The current visual direction is A; [the standalone prototypes](apps/web/prototype/README.md) remain exploration evidence. No database, AWS resource or production credential is needed for this ticket.

## Project documentation

- [Requirements](docs/planning/AEKI-product-search-app-requirements.hu.md).
- [Architecture and folder structure](docs/architecture/folder-structure-proposal.hu.md).
- [Engineering principles](docs/architecture/engineering-principles.hu.md).
- [C4 System Context](docs/architecture/01-system-context.md).
- [C4 Container](docs/architecture/02-containers.md).
- [C4 Component – backend data flow](docs/architecture/03-components.md).
- [AI-assisted engineering measurement log](docs/engineering/ai-assisted-engineering-log.md).
- [React UI implementation plan](docs/planning/react-ui-implementation-plan.md).
- [ADR-0003: frontend theme and localization boundaries (proposed)](docs/architecture/adr/0003-frontend-theme-and-localization.md).
- [ADR-0001: engineering principles](docs/architecture/adr/0001-engineering-principles.hu.md).
- [ADR-0002: integration and E2E testing](docs/architecture/adr/0002-integration-and-e2e-testing.hu.md).
- [ADR-0004: foundation toolchain and health contract](docs/architecture/adr/0004-foundation-toolchain-and-health-contract.md).
- [Published issues](docs/planning/github-implementation-issues.md).
- [Issue #1 Mikado plan](docs/planning/issue-1-mikado-plan.md).

Accepted principles: SOLID, TDD, TypeScript contracts with runtime validation, OpenAPI, ADR and C4; meaningful integration and critical end-to-end verification accompany unit tests.

GitHub tracks this AEKI delivery under Csaba's explicit instruction. Cross-project priorities and AI-assisted methodology remain in Linear. Documentation is English; older source documents retain historical filenames. Personal learning notes remain outside this repository.

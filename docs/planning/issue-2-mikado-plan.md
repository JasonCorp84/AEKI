# Mikado Plan — Issue #2: PostgreSQL Readiness

Date: 2026-10-02. Updated: 2026-10-03. Status: **explicitly approved, implemented and verified locally; awaiting user review**. Parent: [GitHub issue #2](https://github.com/JasonCorp84/AEKI/issues/2). Issue #1 was explicitly accepted and closed as completed. Issue #2 remains open; no assignment or active-priority change is made. The proposed design below preserves the planning baseline; actual results are recorded in the implementation evidence.

## Goal and baseline

**G:** From a reproducible local setup, the browser distinguishes an alive API from a database-ready API. Stopping PostgreSQL leaves API liveness intact and produces a bounded, truthful not-ready response. Restarting PostgreSQL and retrying restores readiness. Isolated migrations, configuration validation and teardown are demonstrated.

Baseline: `6c0c3751f386e2c6aa22dcb16d906fe41b7d5069`, branch `codex/foundation-health`. React, Nest, strict TypeScript, OpenAPI generation, Ajv validation and the RTK Query journey already exist. Two pre-existing whitespace edits in the parser and generator are protected. PostgreSQL configuration, adapter and migrations are absent. Docker CLI reports 28.0.4; daemon availability is **unverified**, and sandbox access to its config was denied. These are observations, not failed implementation experiments.

Keep the existing `/health` contract and A visual direction. Preserve prototypes, semantic theme tokens and typed text replacement. Product tables/search, authentication, AWS deployment and CI implementation are outside #2; CI is #3. No production application or test code is added by this planning task.

## Proposed observable contract

Keep GET `/health` returning its existing 200 liveness payload, independently of database availability. Add GET `/readiness` with generated response types and runtime validation for **both** expected status codes:

| HTTP | Example JSON | Meaning |
| --- | --- | --- |
| 200 | `{ "status": "ready", "database": "reachable" }` | A real connectivity query succeeded |
| 503 | `{ "status": "not_ready", "database": "unreachable", "code": "DATABASE_UNAVAILABLE" }` | The database cannot currently be reached |
| 503 | `{ "status": "not_ready", "database": "unreachable", "code": "DATABASE_TIMEOUT" }` | The bounded check did not complete |

These originally proposed payloads are now implemented in OpenAPI, generated TypeScript and runtime validation. Known, schema-valid 503 responses are handled as readiness results despite RTK Query's usual non-2xx error path. Unexpected status/body, malformed JSON and network failure remain distinct outcomes. Readiness proves connectivity, not product-schema completeness, database write permissions or business correctness.

The UI shows API liveness and database readiness separately. If a valid readiness response arrives, it establishes an HTTP response from the API even when the database is down. If readiness transport fails, the independently observed liveness result remains separate: report "readiness check failed" rather than inventing a database outage. During retry, show checking feedback and avoid presenting stale data as the current check's success.

Missing/malformed required database configuration fails startup with an actionable sanitized message. A syntactically valid configuration pointing at an unavailable database keeps the API process alive and returns not-ready. No HTTP body or public startup message exposes a connection URL, password or raw driver error.

## Mikado graph and proposed order

See the [separate Mermaid graph](diagrams/issue-2-mikado.md). Arrows mean **requires**; G is at the bottom. Every dependency below is a planning hypothesis until an actual small probe confirms it. Proposed implementation order:

**M0 → M1 → M2 / C → M3 → M4 / M5 → M6 → M7 → G**.

M3 needs the reproducible tooling from M1, not the migrations in M2. M2 can therefore move later if it does not block the smallest connectivity probe. M4 and M5 share the contract prerequisite; frontend fixtures can be implemented before the actual API route if useful.

| Node | Minimal attempt after approval | Keep the change only when |
| --- | --- | --- |
| M0 — Protect baseline and agree seams | Record HEAD/local edits; confirm the four test seams below and existing #1 checks | Recovery scope is clear and no user changes are overwritten |
| M1 — Reproducible PostgreSQL and tooling | Add local Compose setup, example connection variables and separate dev/test databases; record ADR-0005 and pin compatible stable versions | Actual server starts; configuration validation works; test database/role/volume cannot accidentally target development data |
| M2 — Isolated initialization/migration | Add one minimal foundation-schema migration, plus migration commands | Apply on fresh test DB, inspect schema/history, apply again without duplicate work, roll back/reapply only in the disposable test environment; no product schema invented |
| C — Shared readiness contract | Define OpenAPI 200/503 responses; regenerate types and runtime schemas | Valid fixtures pass, invalid data fails, generation is reproducible; both consumers can use the contract |
| M3 — Real bounded database probe | Through a narrow `checkReadiness` interface, run the minimum real connectivity query | Actual PostgreSQL success, connection refusal and controlled nonresponse return within budget; retries recover; checked-out clients are released/destroyed and shutdown closes the pool |
| M4 — Nest HTTP mapping | Use C; observe HTTP RED; connect readiness orchestration to the real adapter | 200/503 payloads validate; `/health` remains 200 during DB outage; error codes are stable and sanitized; malformed/missing config is actionable |
| M5 — React readiness feedback | Exercise actual Redux/RTK Query with HTTP interception; handle typed 200 and 503 outcomes | Loading, ready, not-ready, invalid response, request failure and retry work; liveness is presented independently; text/styles retain replacement seams |
| M6 — Real connected journey | Use actual browser → Nest → PostgreSQL | DB stop leaves API alive and UI not-ready; DB restart + retry restores ready; no mock fallback |
| M7 — Independent reproduction and teardown | Repeat documented installation, database setup, migration and startup in an isolated candidate | Existing/new checks and builds pass; fresh journey works; owned processes/connections stop; disposal targets only the explicit test environment |

## Proposed tooling decision

Prefer **node-postgres (`pg`) plus `node-pg-migrate`**: direct, explicit SQL connectivity with a separate versioned migration mechanism. This keeps the readiness adapter small and demonstrates database behavior without committing to an ORM or product model. Cost: connection ownership, error normalization and later row mapping remain explicit responsibilities. Prisma/Drizzle may simplify later product persistence, but introduce model/tooling decisions that this connectivity slice does not yet justify. Revisit the ADR when product-query requirements arrive.

Choose exact compatible **stable** package versions and a pinned PostgreSQL image during M1; verify Node 24/ESM compatibility before adoption. The migration documentation currently defaults to a prerelease version, so do not infer a stable release from that page. Record alternatives, consequences and review trigger in ADR-0005 before keeping the tooling change.

Use separate database names, credentials and owned test storage; destructive migration/reset commands require the explicitly isolated test target. Compose service health and `pg_isready` help startup sequencing, but do not replace the application's real connectivity proof. Development database teardown preserves its data by default; removal of test resources names only the owned disposable target.

## Timeout and lifecycle hypothesis

Propose a **two-second total database-probe budget**, below the existing three-second browser HTTP timeout. Connection acquisition and query execution share a remaining deadline; their sequential limits must not add up to more than the promised budget. Test the actual elapsed bound with reasonable scheduling tolerance.

Configure connection and query limits, handle background pool errors, release clients after success, destroy unusable clients after failures, and end the pool on Nest shutdown. A timeout race that merely stops awaiting an active query is insufficient: implementation must demonstrate cleanup/cancellation. A deterministic isolated-server pause/nonresponse probe should verify this after approval; resume the owned test service in cleanup. If driver behavior cannot meet the budget without leaked work, record the new prerequisite and revise the adapter before continuing. A connection-refused test alone does not prove timeout handling.

## Test seams proposed for approval

1. **Contract:** unknown JSON → validated readiness result, covering 200 and 503 schemas and invalid examples; reproducible generation/drift check.
2. **Real PostgreSQL and Nest HTTP:** isolated DB migration/probe behavior and actual HTTP mapping, including outage with unchanged liveness, bounded nonresponse, recovery and cleanup. Driver mocks cannot establish these guarantees.
3. **React interaction:** visible feedback and retry with actual Redux/RTK Query and network interception. HTTP fixtures prove response interpretation, not real database connectivity.
4. **Connected journey:** actual browser, Nest process and PostgreSQL, including stop/restart. Record whether evidence is manual browser automation or a committed automated E2E test.

Approving this plan approves these seams and the proposed direction. Implement one meaningful behavioral RED → minimum GREEN → refactor at a time. Configuration/scaffolding needs direct command evidence rather than tests that mirror files. Do not write the entire test suite before implementation.

## Experiment and undo policy

After approval, first attempt the smallest current goal: determine what is missing to ask the real API for database readiness. Missing files are setup evidence; a missing HTTP operation may yield an actual 404 only when run. No failures are invented here.

Record each probe, actual blocker, required edge, result and kept/undone scope. Undo only unsuccessful experiment-owned edits while preserving baseline/local edits and previously verified steps. Keep TDD RED tests while implementing their GREEN behavior. Separate expected REDs, dependency discoveries, technical retries and user corrections in the engineering log.

| Experiment | Current evidence | Next action |
| --- | --- | --- |
| E0 — Goal probe | Executed after explicit approval: actual readiness HTTP test returned 404 | Added the contracted route and real adapter; HTTP success/outage/recovery verified |
| E1 — Test-server restart | Docker-assigned port changed across stop/start, breaking the test connection URL | Reserve one loopback port per owned test project and retain it until teardown |
| E2 — Migration ordering | tmpfs data disappeared across the outage test's stop/start; migration smoke found a fresh history unexpectedly | Use an owned per-run named test volume; preserve it during outage, delete it at final teardown |
| E3 — Probe deadline | Paused real PostgreSQL exceeded the test timeout before a total deadline was implemented | Share a two-second deadline across acquisition/query and destroy a timed-out checked-out client; recovery/shutdown pass |
| E4 — React retry observation | A timing-based loading assertion raced with the mocked response | Explicitly release the network fixture after checking loading/stale-success removal |
| E5 — Independent candidate | Fresh npm install, all 40 tests, lint/types/build and real browser startup passed | Candidate tree `58a3329675983afff40b229503bbc1870d889bd0`; no commit created |

## Exit conditions

- [x] Reproducible dev and isolated test PostgreSQL setup, connection examples and safe teardown verified.
- [x] Adopted tooling ADR, exact pins and minimal migration smoke proof recorded.
- [x] OpenAPI-generated/validated readiness successes and failures; original liveness preserved.
- [x] Real database adapter demonstrates bounded success/failure, cleanup and recovery.
- [x] Actual Nest HTTP maps outcomes without exposing sensitive diagnostics.
- [x] React shows ready/not-ready/invalid/request-failure/loading/retry through the real client.
- [x] Actual browser/API/database outage and recovery demonstrated separately from mocked frontend tests.
- [x] Missing configuration fails clearly; isolated fresh setup/check/build/teardown reproduced.
- [x] Meaningful RED/GREEN/refactor, skills, timings, retries and limitations recorded in English.

All local acceptance nodes M0–M7 and C have evidence in the [implementation session](../engineering/sessions/2026-10-03-postgresql-readiness-implementation.md). The independent source checkout used copied example configuration and the existing development database for its browser startup; its API test run created a separate fresh database and removed its owned storage. No published fresh checkout or committed automated E2E suite is claimed. The candidate snapshot predates the final documentation updates; application code is unchanged since verification.

## Primary references

[node-postgres Pool](https://node-postgres.com/apis/pool) documents connection limits, client release/destruction, shutdown and background errors. [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) describes versioned JavaScript/TypeScript/SQL migrations. [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/) describes health-based startup sequencing. The particular contract, budget and graph above are AEKI design proposals.

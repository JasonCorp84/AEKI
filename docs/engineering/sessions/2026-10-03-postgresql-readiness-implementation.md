# Issue #2 — PostgreSQL Readiness Implementation Evidence

Sequence: S45 initial implementation (2026-10-02), S46 continuation (2026-10-03). Parent: [approved Mikado plan](../../planning/issue-2-mikado-plan.md), [GitHub #2](https://github.com/JasonCorp84/AEKI/issues/2). Csaba explicitly approved implementation and all four proposed test seams, then requested continuation and reported that Docker was started. This is implementation within an existing commitment; no priority, assignment or external issue state was changed.

Baseline: `6c0c3751f386e2c6aa22dcb16d906fe41b7d5069`. Working branch: `codex/postgresql-readiness`. Preserve pre-existing parser/generator whitespace changes. Implementation remains uncommitted; issue #2 remains open for user review.

## Timing and measurement limits

Original delivery checkpoints: S45 first clock `2026-10-02T10:14:37Z`; S46 first clock `2026-10-03T18:50:07Z` and delivery-preparation clock `2026-10-03T19:13:01Z`. The observed S46 checkpoint interval was 1,374 seconds, not the full turn duration. S45 ended after an approval-review usage-limit rejection.

**Reconciliation, 2026-10-04:** actual task events have now supplied the exact assistant-turn timing below. These supersede the original unknown timing fields and preserve the earlier observations as checkpoints.

| Sequence | Turn ID                                | Start UTC                  | Completion UTC             | Wall seconds |
| -------- | -------------------------------------- | -------------------------- | -------------------------- | ------------ |
| S45      | `01a0fc1b-8de9-7aa2-b7ef-38eb71a155f4` | `2026-10-02T10:14:19.604Z` | `2026-10-02T10:30:48.752Z` | 989.148      |
| S46      | `01a10319-80ab-74a0-9858-c1e240cc10be` | `2026-10-03T18:49:25.528Z` | `2026-10-03T19:14:14.653Z` | 1489.125     |

These are assistant-turn wall times, not active human/engineering time or a claim of accepted task completion. The overnight gap is excluded. Token counts and human active time remain unmeasured. The implementation was subsequently committed/pushed as `3d8f029`; the delivery-time uncommitted statement above records the original snapshot.

## Applied techniques and skills

TDD followed the agreed public seams: unknown JSON parsing; actual PostgreSQL and Nest HTTP; React interactions with actual Redux/RTK Query and MSW at the network boundary; real browser → running Nest → PostgreSQL. Mikado prerequisite discoveries changed test infrastructure before keeping dependent behavior. Clean Code and SOLID shaped a narrow database probe interface, Nest composition/provider, separate transport/state selection/presentation, typed message replacement and semantic styling.

| Skill                            | Application and load status                                 | Observed contribution                                                                        |
| -------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `tdd`                            | Applied on S45 and reloaded on S46; approved seams retained | Behavioral RED → minimum GREEN, followed by refactoring and regression checks                |
| `codebase-design`                | Reused earlier guidance during S45                          | Keep database-driver details behind the probe; separate frontend transport and presentation  |
| `browser:control-in-app-browser` | Fresh current-bundle load on S46                            | Actual connected outage/recovery, independent candidate startup and narrow-screen inspection |
| `vercel:react-best-practices`    | Fresh load on S46                                           | Derived query state without effects, event-based retry, no unnecessary memoization           |

No subagents or formal independent code-review run were used. No relevant AEKI memory result was used. Skill application is an observation, not proof that a skill caused a speed/quality improvement.

## Meaningful RED → GREEN observations

1. Valid readiness JSON initially failed the placeholder parser; generated OpenAPI schema/Ajv validation accepted it.
2. Actual PostgreSQL readiness failed the not-ready placeholder; a real `SELECT 1` established success.
3. Refused TCP connection exposed driver failure before normalization; the public result became sanitized `DATABASE_UNAVAILABLE`.
4. Paused PostgreSQL exceeded the timeout before a shared deadline; a two-second total budget with client destruction bounded the response and allowed recovery.
5. Actual Nest `/readiness` returned 404; the controller/provider mapped real results to contracted 200/503.
6. React had no database-ready feedback; the actual RTK Query endpoint and view made it visible.
7. A valid 503 appeared as a request failure; accepting and validating both expected HTTP statuses produced not-ready with retry/recovery.
8. Malformed readiness data appeared as a generic failure; invalid-response feedback separated it from transport failure.

Additional malformed fixtures, migration and configuration checks are regression evidence; no separate RED is claimed for every assertion. After GREEN, readiness presentation was extracted from the connected component. The full checks ran after that refactor.

## Technical retries, discoveries and confounders

Expected TDD REDs above are separate from technical retries. The following recovery episodes were observed; exact aggregate repeat-operation count across both turns is unaudited.

| Episode                       | Reason and recovery                                                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest runner resolution      | Package subpath was not exported; resolve its package manifest and adjacent executable instead                                                                                |
| Docker restart port           | Docker-selected publishing port changed on stop/start; reserve a per-run loopback port                                                                                        |
| Test app teardown             | Re-closing an earlier Nest app ended its pool twice; clear the app reference after close                                                                                      |
| Migration ordering            | tmpfs did not retain history across the outage restart; use an owned per-run named volume, deleted at final cleanup                                                           |
| Docker availability           | Engine was unavailable during initial attempts; supported Desktop startup and the user's Docker action restored it; two failed API attempts were observed during S46          |
| Approval service interruption | S45 escalated verification was rejected because approval-review usage was exhausted, rather than because the operation was unsafe; work resumed after the user's continuation |
| Frontend loading observation  | A timed mocked response raced with the assertion; use an explicitly released response and await visible checking feedback; one failing loading-test iteration was observed    |
| Documentation lookup          | Two guessed documentation/metrics paths did not exist; actual files were located; application behavior was unaffected                                                         |

Self-revisions include the total deadline, stable test port, persistent-within-run test storage, presentation extraction and deterministic loading fixture. User-requested quality corrections in this implementation: none observed. The Docker message is environment support, not a quality correction. Earlier UI-design corrections belong to their own tasks.

## Verified outcomes

`npm run check` passed: generated-contract consistency, lint, strict type checks, **16 contract + 9 actual database/API/migration + 15 React tests = 40**, then production builds for both apps. API tests created a fresh uniquely named PostgreSQL project and removed its container, network and volume after completion. Migration smoke inspected schema/history, verified repeat apply, rollback and reapply. Missing/malformed database configuration exits with sanitized diagnostics. `/health` remains unchanged and independent.

`npm run verify:clean` independently installed 419 packages (423 audited; zero reported vulnerabilities), ran the same full checks and retained candidate tree `58a3329675983afff40b229503bbc1870d889bd0` at `C:/Users/csaba/AppData/Local/Temp/aeki-clean-DFWVLP/checkout`. npm reported an unapproved MSW postinstall script; tests succeeded without relaxing the script policy. This is a candidate snapshot, not a published fresh GitHub checkout. Final documentation updates occurred afterward; application code was unchanged.

The independent candidate copied `.env.example`, ran `db:up`, `db:migrate` and `dev`, and displayed API reachable/database ready through its actual browser at port 5176/API 3003. This startup reused the existing development DB; the candidate's preceding API tests used a freshly created isolated DB. Ctrl+C stopped candidate processes, and neither candidate port remained listening. Candidate files are retained for inspection.

The source preview at `http://127.0.0.1:5175/` uses API port 3002 and the real development DB. Browser evidence: ready → `docker compose stop postgres` → separate API recheck still reachable plus database not-ready → restart/wait → retry → ready. No runtime warning/error entries were returned by the captured browser log query. Narrow-screen inspection reported DOM content width 375 and viewport width 375, with readable stacked content and no horizontal overflow; temporary viewport override was reset.

Local screenshots are outside the repo:

- `C:/Users/csaba/.codex/visualizations/2026/10/01/01a0f5ea-36b8-7dd3-8ede-3f06ab4ac6b9/aeki-database-outage.png`
- `C:/Users/csaba/.codex/visualizations/2026/10/01/01a0f5ea-36b8-7dd3-8ede-3f06ab4ac6b9/aeki-database-ready.png`
- `C:/Users/csaba/.codex/visualizations/2026/10/01/01a0f5ea-36b8-7dd3-8ede-3f06ab4ac6b9/aeki-database-mobile.png`

Development storage and source preview remain running for review. Owned `aeki-test-*` containers and named volumes were absent after verification. Other Docker resources were not removed.

## Practical limits and review trigger

Readiness proves connectivity only; it does not establish product-schema completeness or write permissions. The real paused-query case demonstrates the deadline, recovery and shutdown; not every concurrent pool-saturation or cold-handshake scenario has been separately exercised. PostgreSQL's exact release tag is pinned, not an immutable digest. Normal test cleanup is verified; abrupt process/OS termination may need manual cleanup of its explicitly named test project. A Docker-start failure can also cause a cleanup failure diagnostic while the daemon remains unavailable. Browser verification is tool-driven manual evidence, not a committed automated E2E suite.

Review the narrow adapter and ADR when product persistence, production deployment, migration concurrency or connection-load requirements arrive. CI/AWS, product tables and full theme/locale switching remain later scope. No commit, push or issue closure is included in this delivery.

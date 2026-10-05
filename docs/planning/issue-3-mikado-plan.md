# Mikado Plan — Issue #3: Real Application Journey in CI

Date: 2026-10-05. Status: **implementation verified; awaiting Csaba's delivery acceptance**. Parent: [GitHub issue #3](https://github.com/JasonCorp84/AEKI/issues/3). Issue #2 was closed as completed at Csaba's request. Approval authorized the scope and three test boundaries below; silence or elapsed time never counts as approval.

## Goal and observed baseline

**G:** A pull request gets reproducible evidence that a real browser can use React, the real Nest API and an isolated PostgreSQL database. An outage leaves API liveness intact and shows database not-ready; restart and retry recover. A deliberate failure makes CI fail visibly and retains useful evidence. Owned services are cleaned up.

Planning baseline: `532672be63164bbe966b2784f509e0f114a7b20d`. Current branch contains the separately captured dashboard prototype; it is not the CI feature branch. Before implementation, inspect the available branch/main state and establish an appropriate `codex/` issue #3 branch without promoting the throwaway dashboard to production.

Already present: pinned Node/npm and locked install, minimally privileged GitHub Actions `Quality gate`, native formatting, OpenAPI validation/generation drift check, lint, strict types, real PostgreSQL/Nest checks, React integration tests, production builds and all four per-file coverage gates. Latest local publication ran 95 passing tests with 100% on 29 inventoried executable files. Historical successful Actions evidence is recorded; it does not replace verification of the final issue #3 commit.

Missing from the current workflow: committed real-browser smoke checks, API/web/browser failure artifacts and demonstrated intentional remote failure for the completed journey. The only uploaded artifact currently is coverage. Do not rebuild existing gates or claim new failures/experiments have already been observed.

## Proposed scope

- Use Playwright Test with an exact compatible version and Chromium only. Verify the package/runtime compatibility and install requirements after approval.
- One browser worker and no automatic retries initially; do not hide a failure behind a passing retry.
- Exercise actual providers, RTK Query, HTTP, Nest and PostgreSQL. No MSW, intercepted success response or stubbed database in the connected journey.
- Reuse the isolated test database conventions: unique Compose project, test-only role/database, stable loopback port, migrations and owned storage. Reuse proven code only where lifecycle and ownership actually fit; avoid an unrelated framework extraction.
- Prefer the built Nest entrypoint and built React assets with a same-origin API proxy. Verify a suitable local server/preview arrangement before committing it; do not assume preview inherits development routing. If the smallest reliable probe uses the Vite development server, record that limitation and resolve the built-web prerequisite before final acceptance.
- Preserve `Quality gate` as the required check and add the smoke journey within its existing outcome. Do not create a passing gate that bypasses failed browser checks.
- No AWS deployment, product search, dashboard implementation or new branch-protection policy.

## Mikado nodes and keep conditions

Arrows in the [separate diagram](diagrams/issue-3-mikado.md) mean **requires**. The goal is at the bottom. Proposed dependencies are hypotheses until an actual probe verifies them.

| Node                                        | Smallest attempt after approval                                                                                                            | Keep only when                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| M0 — Protect baseline and agree boundaries  | Inspect branch/local state, current issue and existing checks; prepare the feature branch                                                  | The scope, source baseline, rollback ownership and test boundaries are clear                                                           |
| M1 — Browser tooling                        | Pin Playwright, install Chromium and run the smallest browser launch                                                                       | It works on local Windows and the selected Linux runner; no invented package compatibility                                             |
| M2 — Owned application fixture              | Start isolated PG, migrate, start actual built API and serve built React with its real API route; wait for bounded readiness               | Browser-bound URL reaches the actual stack; no reused developer DB/process; startup failures retain diagnostics                        |
| M3 — Connected health/readiness RED → GREEN | Assert visible initial liveness/readiness; stop owned PG, retry, then restart and retry                                                    | UI distinguishes healthy API from unavailable DB, and recovery uses actual HTTP/database; assertions fail when the real path is broken |
| M4 — Failure evidence and teardown          | Exercise failing assertion, failed startup and interruption cleanup; collect safe logs/report/trace                                        | Exit code stays nonzero, useful evidence survives cleanup, and only owned resources are stopped/removed                                |
| M5 — CI wiring                              | Add browser installation and smoke command to the existing quality workflow; retain artifacts on failure                                   | Existing checks and smoke both affect the required gate; no production secrets or weakened coverage                                    |
| M6 — Remote negative proof                  | Run final candidate successfully; make a temporary branch change that fails contract validation and another that fails a browser assertion | Actual Actions runs fail at the intended boundaries; browser failure has readable artifacts; restore deliberate mutations afterward    |
| M7 — Reproduction and handoff               | Run documented clean installation, full checks and smoke; inspect final passing Actions run                                                | Local command, CI command, artifacts, resource cleanup and coverage are documented with actual results                                 |
| G — Completed issue #3                      | Review acceptance evidence                                                                                                                 | All ticket criteria are evidenced and Csaba accepts completion                                                                         |

Proposed order: **M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → G**. M4 also checks fixture startup/cleanup failures from M2. M7 retains the existing quality gates; browser success alone is insufficient.

## Proposed test boundaries for approval

1. **Browser → real application → PostgreSQL:** visible health/readiness, outage and recovery through actual Redux/RTK Query and HTTP. Test through accessible UI labels and observable responses, not component internals or mocked hooks.
2. **Runner/process lifecycle:** the public smoke command's exit code, bounded startup, failure diagnostics and owned resource teardown, including failure before all services start. Use isolated real subprocess/filesystem checks for these guarantees; add narrow fault injection only for failures that cannot be induced safely at this boundary.
3. **Actual GitHub Actions outcome and artifacts:** final successful run plus deliberate contract and browser failures in temporary branches/PRs. Read actual output and inspect artifacts; merely inspecting YAML does not establish CI behavior.

Approval of this plan includes these proposed boundaries. Follow one meaningful RED → minimum GREEN → refactor slice at a time. Expected TDD REDs and deliberate negative-proof runs are not technical retries. Existing 100% lines/statements/functions/branches policy remains mandatory for newly inventoried executable tooling; test/fixture/configuration exceptions remain those already agreed. Do not relocate production orchestration into an excluded fixture merely to bypass coverage. E2E execution complements existing coverage; it is not a replacement percentage gate.

## Lifecycle, diagnostics and budget hypotheses

Use bounded startup/test/shutdown waits; no fixed sleeps as readiness evidence. Reserve and pass owned ports consistently; do not reuse an already running user's service. Preserve test storage across stop/restart, and remove it at final cleanup. Readiness waiting during initial startup is distinct from deliberately testing outage.

Install signal and failure cleanup appropriate to Windows and Linux. Playwright can manage application web servers; database ownership and failed partial startup still need explicit handling. Verify cleanup on success and failure before remote delivery. Do not promise recovery from abrupt runner termination; unique project ownership and disposable CI environments bound the impact.

Proposed artifacts: Playwright report, retained-on-failure trace, failure screenshot, and sanitized API/web/test-database logs. Retain for 14 days, matching the existing coverage artifact policy. Logs must exclude connection strings, credentials and complete environment dumps; upload explicit paths rather than the workspace. Traces can contain response data, so use only test-local data and review a sample artifact before publication.

Keep the existing 20-minute job limit initially; measure actual duration and revise only if bounded legitimate execution needs it. Exact stage budgets should follow the smallest local probe, with the public database/request deadlines preserved.

## Experiment and undo ledger

The approved experiments are now recorded in the [implementation session](../engineering/sessions/2026-10-05-issue-3-browser-ci.md). Observed prerequisites included the full Chromium channel and keeping service logs outside Playwright's cleared output directory. Both temporary proof mutations remained off main; the implementation branch was restored and their remote branches removed after inspection. Local proof commits remain recoverable. No user-owned resources were removed.

| Probe                                | Status   | Expected evidence                                                                                                                     |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Browser launch / compatible pin      | Verified | Playwright 1.63.0, Node 24.18.1; full Chromium on Windows and Linux                                                                   |
| Built web to actual API              | Verified | Actual browser-visible responses, test-only proxy and migrations                                                                      |
| Outage and retry recovery            | Verified | Real PG stop/restart, HTTP 503/200 and visible UI recovery                                                                            |
| Failing assertion / partial startup  | Verified | Nonzero results, real subprocess/filesystem regressions and owned cleanup                                                             |
| Remote contract and browser failures | Verified | Runs 37323688463 and 37323816953; screenshot, trace and logs inspected                                                                |
| Final clean reproduction             | Verified | Independent locked install, final checks and smoke; green candidate run 37323547722; documentation follow-up check recorded in PR #18 |

## Exit conditions

- [x] Csaba explicitly approves this plan and its public test boundaries.
- [x] Locked browser tooling and isolated stack launch are reproducible.
- [x] Committed browser checks verify real health/readiness, outage and recovery.
- [x] Startup/failure/shutdown preserve diagnostics and clean owned resources.
- [x] The existing required quality outcome includes browser smoke failures.
- [x] Safe logs/browser artifacts survive failed runs.
- [x] Intentional remote contract/browser failures and the runtime candidate green run are verified; final documentation-only follow-up is checked in PR #18.
- [x] Existing checks, production builds and required coverage remain passing.
- [x] Local/CI commands, evidence limitations, timings, skills and retries are documented.
- [ ] Csaba reviews the result before issue completion.

## Primary references

[Playwright CI](https://playwright.dev/docs/ci) covers browser installation and one-worker CI execution. [Web server management](https://playwright.dev/docs/test-webserver) covers startup and lifecycle configuration. [Trace viewer](https://playwright.dev/docs/trace-viewer-intro) covers failure investigation. These support the tooling proposal; AEKI's isolation, acceptance journey and approval gate are project decisions.

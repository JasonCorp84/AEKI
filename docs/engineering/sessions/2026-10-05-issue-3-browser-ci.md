# Issue #3 — Built Browser Journey in CI

Status: implementation and remote proofs verified; awaiting delivery review. User explicitly approved the Mikado plan and its three test boundaries. [Draft PR #18](https://github.com/JasonCorp84/AEKI/pull/18) holds the reviewable change. Issue #3 remains open until delivery acceptance; no merge was performed.

## Baseline and scope

Implementation branch: `codex/ci-browser-journey`, based on current `origin/main` at `71a29c9`. The separately captured engineering dashboard is excluded. No deployment or product search work is included.

Skills: `tdd` (reused), `pr` (review handoff). Techniques: approved public seams, one vertical RED/GREEN slice at a time, actual PostgreSQL/Nest/browser connection checks, safe artifact inspection, owned process cleanup and remote negative proof. No sub-agents were delegated for this implementation.

## Observed experiments

- Pinned Playwright Test 1.63.0 accepts Node >=20; the project uses 24.18.1. Chromium full-channel launch and the initial built application journey passed on Windows.
- The optional headless-shell download failed with connection reset, timeouts and DNS errors. Full Chromium had downloaded successfully. The committed full Chromium channel uses the documented `--no-shell` installation, without a machine-specific executable path.
- The first public runner test failed because the runner did not exist; implementation passed while preserving a real child exit code of 7 and redacted diagnostics.
- A real run exposed Playwright clearing `test-results`, deleting service logs and preventing teardown. Move service logs outside that directory. The two affected owned probe projects were explicitly removed; no unrelated resources were removed.
- Failed startup with unavailable database logs first escaped cleanup. Its RED/GREEN test now verifies that the owned project is still removed.
- The browser outage assertion first failed while PostgreSQL remained available. After adding the real stop/restart stimulus, visible outage/recovery passed.
- Interruption RED exposed a hung real child. The process-tree boundary now terminates it before database cleanup; real child, deadline, setup interruption and failed cleanup checks passed on Windows.
- A real missing child executable produced a negative OS exit code. Normalize it to a failing exit code of 1; the public test passed.
- A stale-evidence RED showed earlier logs surviving into a new run. Reset only the three owned log files per invocation; the regression passed.

Artifact storage loss also produced a genuine RED: a filesystem error bypassed database cleanup. The nested cleanup guarantee passed after correction.

Local final `npm run check` passed: 104 tests and all four metrics at 100% for 30 inventoried executable files. The independently installed candidate passed `npm ci` and all checks (tree `dded7b6e9e1a78d6be0aa4cb836ad300d7e74308`). After the final artifact-storage correction, the root full check passed again and the final browser command passed both in the root and in that independently installed checkout updated with the correction. The independent browser run removed its owned project and volume.

Audited agent-initiated technical recovery retries: **12**. This corrects the preliminary checkpoint count and applies the engineering log's failure-recovery definition consistently:

- Two command-boundary recoveries after sandbox-denied Docker/CIM diagnostics.
- One browser installation recovery using the documented full Chromium channel. SDK-internal download retries were observed separately; their complete count is not audited in this manual total.
- One repeated real-stack probe before the deleted-artifact-directory failure was fully corrected.
- One Compose cleanup-command retry with the required port variable.
- One formatter retry after its unsafe-finally rejection.
- One measurement-check retry after correcting the new retry field.
- One coverage execution retry after an overlapping source edit invalidated its mapping.
- One replacement of a failed PowerShell process-stop attempt with verified owned-PID `taskkill`.
- Two failed patch-context recoveries.
- One PR artifact attachment correction from the mistakenly entered #19 to the actual #18; the incorrect attachment was removed.

Expected TDD REDs, coverage-gap discovery, Mikado dependency discoveries, planned remote failures and successful fresh verification are development feedback or validation rather than technical retries. No user-requested acceptance correction occurred during this implementation turn. Human active time remains unmeasured.

## Actual remote evidence

| Probe                                | Commit                                     | Actions outcome                                                                       |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Complete runtime candidate           | `55784d66fda40723f59bb81e8bc09d4f917f89aa` | [37323547722 — success](https://github.com/JasonCorp84/AEKI/actions/runs/37323547722) |
| Invalid OpenAPI version              | `e66584a96fd0f29cf263f0a89565f4f2e8536ec9` | [37323688463 — failure](https://github.com/JasonCorp84/AEKI/actions/runs/37323688463) |
| Deliberately missing browser heading | `bfc26091a24955aea3ef126331754887afdc5ab1` | [37323816953 — failure](https://github.com/JasonCorp84/AEKI/actions/runs/37323816953) |

The successful `Quality gate` took 140 seconds on Ubuntu 24.04, from 14:17:49Z to 14:20:09Z; the existing 20-minute budget is sufficient for this observation. It retained both coverage and browser artifacts. The contract proof failed in the quality step with `Unsupported OpenAPI version: 0.0.0` and exit code 1. The browser proof passed earlier gates, then failed the real-browser step with exit code 1. Both success and failure logs show the owned PostgreSQL container, network and volume removed.

Downloaded the failed-browser artifact `11350783938` (1,004,342 bytes). It contains an HTML report, failure screenshot, trace, error context, redacted browser/API/preview logs, PostgreSQL logs and safe port/project ownership metadata. Visually inspected the screenshot: API reachable and database ready remain visible while the deliberately nonexistent heading assertion fails. The trace contains only loopback navigation/assets/health/readiness requests. Its inspected text entries contain no PostgreSQL connection URLs, test password or GitHub token markers; service logs contain neither the test password nor a PostgreSQL URL. This is a sample inspection with explicit patterns, not a general secret-detection guarantee. Artifact expiry is 2026-10-19T14:22:14Z, matching the 14-day policy.

Removed the two temporary remote proof branches after verification. Local proof commits remain recoverable; the feature branch contains neither deliberate mutation. The final documentation-only follow-up retains the same runtime and is verified through the final run linked in PR #18 before handoff. Raw downloaded artifacts and current conversation evidence remain under Git-ignored `.conversations/ci/`.

## Timing

Turn ID: `01a10c49-e7ae-7f60-84fe-453fd2da534f`. Recorded start: `2026-10-05T13:38:52.615Z`. The completed-turn event does not exist until delivery, so its duration remains pending rather than fabricated. The CSV checkpoint records observable progress, not human active time.

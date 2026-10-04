# S50 — Automated Measurement Validation

Request: Csaba emphasized that measurements matter and requested a separate test. He explicitly approved event extraction, measurement validation and command-exit behavior as the three test seams. Outcome: a separate eight-test suite, a real-CSV validation command, metadata-only timing reconciliation and integration into root test/check commands.

Actual turn ID: `01a10343-d142-7c72-a6fa-40414ade3642`. Start is sourced from the Codex task-start event in the CSV, not from the first clock call. Observed delivery-preparation checkpoint: `2026-10-03T19:46:48Z`. The turn remains `in progress` until the completion event exists; the next turn must synchronize it. Exact completion, final wall duration and human active time are not fabricated.

Skill applied: `tdd`, freshly loaded with its test/mocking guidance. Technique: approved public seams, incremental RED/GREEN, real file/process boundary tests, source-based timing recovery. No subagents, memory result or external project-state update was used.

Observed RED/GREEN slices: missing timing extractor → known elapsed durations; missing row validator → reject unknown completion; wrong duration accepted → timestamp consistency; unaudited new retry/missing evidence accepted → reject; missing CLI → real exit 0/1 with actionable diagnostics. Interrupted/conflicting event and duplicate/empty-log cases were additional regression checks, not separately claimed REDs.

Technical retry audit: **1** recovery episode. The CLI test initially used a URL pathname, retaining `%20` in a Windows path; it was corrected to `fileURLToPath` and rerun. The subsequent missing-CLI failure was an expected implementation RED. Expected TDD RED executions are separate from technical retries. No user-requested quality correction occurred in this implementation; seam confirmation was planning input.

Actual data recovery: S43 93.076s; S44 457.299s; S45 989.148s; S46 1489.125s; S47 84.270s. The overnight gap between S45/S46 is excluded from turn wall time. S47's commit/push result was updated from the already observed matching local/remote commit. Historical retry totals remain unaudited where evidence was not reviewed fully.

Validation: `npm run check` passed: the real CSV validator (with explicit historical warnings), OpenAPI consistency, lint, strict types, **8 measurement + 16 contract + 9 PostgreSQL/API + 15 React = 48 tests**, and both production builds. Test DB container/network/volume cleanup succeeded. No product behavior or dependency version changed, and no new npm dependency was added. The final CSV row remains open honestly; completion reconciliation requires the next turn.

See [validation policy and commands](../measurement-validation.md). The checker prevents incomplete recorded new tasks from silently passing; it is not yet a Codex lifecycle hook and cannot independently detect every unrecorded conversation.

**Reconciliation, 2026-10-04:** the actual completion event is `2026-10-03T19:47:32.073Z`; start `2026-10-03T19:35:38.654Z`, assistant-turn wall time **713.419 seconds**. The CSV is finalized. The original open-row descriptions above refer to the delivery-time snapshot, not the current measurement state.

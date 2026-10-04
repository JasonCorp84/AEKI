# S55 — Reject Empty Coverage Instrumentation

## Outcome and scope

Csaba authorized fixing the review's P2 finding: an executable source file with empty coverage maps incorrectly passed as four 100% metrics. The existing approved testing boundary is the coverage CLI's exit code and diagnostic for missing or incomplete measurement evidence.

The gate now rejects zero measured statements for an inventoried executable source. Zero functions or branches remain valid when statements are measured and covered. No coverage thresholds or scope exclusions changed.

## Technique and validation

- Skill: `tdd`, including its test and mocking guidance. No subagents were used for this fix.
- RED: a real CLI regression test supplied an executable function and empty Istanbul maps. It failed because the command returned 0 instead of the required 1.
- GREEN: the statement instrumentation check made the same test pass with an actionable diagnostic.
- A compatibility test uses a measured constant export with zero functions and branches and verifies successful CLI execution.
- Expected RED feedback is not a technical retry. Observed technical retries: 0.
- Full `npm run check` passed: 28 root tooling + 7 database tooling + 16 contracts + 17 React + 27 Nest tests = 95 tests. All four metrics remain 100% for each of 29 inventoried executable sources. Native Prettier, measurement validation, contract drift, lint, strict type checking and production builds passed. The isolated PostgreSQL test instance was removed by the runner after verification.

Task start was `2026-10-04T06:31:08.309Z`, from the session event for turn `01a1059b-f0c5-7ca0-b15d-7e087cca18d8`. The publication turn reconciled the actual completion event at `2026-10-04T06:35:22.300Z`: elapsed assistant-turn time was **253.991 seconds**, including tool execution and waiting. Human active time is not measured.

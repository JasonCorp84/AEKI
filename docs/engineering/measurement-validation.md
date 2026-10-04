# Engineering Measurement Validation

The measurement CSV is evidence, not a collection of estimates. A completed assistant turn must have a recorded turn ID, UTC start/completion and a duration consistent with those timestamps. From S48 onward, an audited numeric retry count, explicit applied skills (`None` when absent) and evidence are mandatory. Human active time may remain `not measured`; it cannot be inferred from assistant timings.

Csaba approved three public test seams: event metadata → timing records; measurement rows → validation diagnostics; CSV file → command exit code. The separate suite exercises all three without mocking private helpers. It verifies missing and contradictory timing, retry/skill evidence, interrupted turns, conflicting events, duplicate task IDs, and real CLI success/failure. A CLI fixture includes commas, escaped quotes and multiline text.

## Commands

```sh
npm run test:measurements
npm run measurements:check
npm run measurements:sync -- --events /absolute/path/to/local-codex-rollout.jsonl
npm run measurements:sync -- --events /absolute/path/to/local-codex-rollout.jsonl --write
```

The sync command defaults to a dry run. It streams the explicitly supplied local event log and retains only timing metadata. It pairs events by turn ID. For a historical row with an unknown ID, its recorded delivery checkpoint must identify exactly one completed turn; ambiguity fails. It never guesses completion, retry counts, skills, user acceptance or business outcome. No machine-specific event path or raw conversation is committed.

`npm test` includes the measurement tests. `npm run check` validates the real CSV before application checks. Invalid new completed rows return exit code 1 with the task/field named. There is no new npm dependency or private event-log requirement for CI or a clean checkout.

## Recording and finalization

1. On the next turn, synchronize the preceding turn after its completion event exists, then run `measurements:check`. Review retry and outcome evidence separately.
2. At task start, append its actual turn ID/start event and mark it `in progress`; do not use a mid-turn clock observation as the exact start.
3. During work, audit technical retries separately from expected TDD failures, revisions and tool-method fallbacks. Record skills and evidence.
4. Before delivery, record a checkpoint and run the check. Only the final row may be `in progress`; it must not claim a completion or duration.
5. After the final response, the completion event becomes available. Finalize that row at the next turn using sync. The current assistant cannot truthfully write its own future completion time.

The checker validates recorded evidence; it does not observe human activity or classify retries automatically. The sync command must be invoked with the correct local log. Tests cannot guarantee that every future conversation is recorded without a lifecycle integration. A final open row is deliberately visible; starting another recorded row before finalizing it fails.

## Historical migration

S43–S47 timing was recovered from actual task events on 2026-10-03. S47's successful commit/push outcome and zero observed technical retries were reconciled with the prior tool results. S48–S50 were added in chronological order.

The fixed legacy boundary is S47, with the actual step/turn-ID/start identity frozen in [historical-measurement-identities.json](historical-measurement-identities.json). Only matching original records inherit legacy warnings. IDs must be canonical (`S01`–`S09`, `S10` onward) and chronologically increasing; an alias such as `S1`, zero ID or a new task reusing an old ID cannot inherit exemptions. Missing/non-numeric legacy retry audits remain warnings, not invented zeros. Only the original S14, S15, S30 and S33 records have a documented historical missing-completion exception. Extending the identity manifest or exception list requires an explicit reviewed policy change.

UTC timestamps must retain their calendar values after parsing and ISO serialization. Impossible dates such as February 31 and normalized midnight overflows are rejected in both event extraction and CSV validation; valid leap days remain accepted.

Historical warnings are outstanding evidence debt. A passing check with warnings means the new required records meet the policy, not that every historical metric has been recovered.

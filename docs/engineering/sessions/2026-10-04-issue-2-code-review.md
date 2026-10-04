# S51 — Issue #2 and Measurement Code Review

Csaba invoked Code Review and explicitly selected the entire issue #2 plus uncommitted measurement changes. Fixed point: `6c0c3751f386e2c6aa22dcb16d906fe41b7d5069`. Committed comparison: `git diff 6c0c3751f386e2c6aa22dcb16d906fe41b7d5069...HEAD`; commit `3d8f029`. Include `git diff HEAD` and relevant untracked measurement scripts/documents. No application or tooling source was edited during review.

Skill applied: `code-review`, freshly loaded. Its required Standards and Spec axes ran in two parallel sub-agents, with independent standards/spec briefs. User confirmed the baseline scope. The skill's expected `docs/agents/issue-tracker.md` is absent; this setup limitation was disclosed. The approved Mikado plan and measurement requirements supplied the spec instead.

Actual start: `2026-10-04T03:58:07.807Z`, turn `01a1050f-db6b-76b0-8672-dd718b6ee97b`. Final completion requires next-turn reconciliation. Human active time is not measured. Technical retries: 0 observed; diagnostic behavior probes are not retries. User scope confirmation broadened the initial proposed review; it was not a quality correction.

Prior S50 timing was reconciled from the actual completion event: **713.419 seconds**. S51 was added as an active measurement. Source-based timing reconciliation and review evidence are the only changes produced during this task. No commit, push, merge or issue state change occurred.

## Standards

1. **P2 — New task IDs can inherit historical exemptions.** `scripts/engineering-measurements.mjs:31–39` checks uniqueness as raw text but the legacy boundary numerically. Appending `S1` alongside existing `S01`, with unaudited retries, returns no errors. This violates `measurement-validation.md`: “new rows cannot silently inherit those exemptions.” Enforce canonical chronological IDs and protect the actual historical record set.
2. **P3 — Recovered timing evidence remains described as unknown.** `docs/engineering/sessions/2026-10-03-postgresql-readiness-implementation.md:9` and the engineering-log summary still say exact S45/S46 timing is unknown, while the CSV now contains IDs, timestamps and 989.148/1489.125 seconds. Add a dated reconciliation note while preserving original checkpoint evidence; AGENTS requires reconciling completed-turn timing when available.
3. **P3 — C4 does not show the implemented readiness boundary.** `docs/architecture/03-components.md:3` still says application code is absent and shows planned product components, omitting the actual readiness controller/probe/PostgreSQL path. Engineering-principles section 6 requires relevant diagrams/status to accompany structural changes. This is a documentation gap, not proof of an API behavior defect.

No further material Clean Code/SOLID violation was identified; heuristic naming changes were not padded into findings.

## Spec

1. **P2 — Historical-ID bypass.** Reproduced with both `S1` and new `S00`: unaudited new retry data is only warned about, contradicting the mandatory audit policy. Add negative tests for aliases and newly introduced low IDs, as well as canonical identity/boundary validation.
2. **P2 — Impossible UTC calendar date passes validation.** `scripts/engineering-measurements.mjs:43` uses regex plus `Date.parse`; JavaScript normalizes `2026-02-31T10:00:00.000Z` to March 3. With end `2026-03-03T10:00:02.000Z` and duration `2`, validation returns no errors. This violates recorded valid UTC timing and prevents the CLI rejecting that invalid input. Check calendar validity/normalization and add a regression case.

No additional concrete issue #2 behavior defect was identified. The paused-server integration covers a query on an existing connection; a nonresponding cold connection-acquisition case remains a separately unproven boundary, not a demonstrated defect.

## Verification and limits

Eight existing measurement tests pass. The two validator defects were independently reproduced through its public function with in-memory fixtures; real CSV data was not corrupted for probes. The committed PostgreSQL/API/UI suite was inspected with prior recorded integration evidence; a fresh Docker/browser run was not performed during this review.

Standards: **3 findings**, highest P2 historical-exemption bypass. Spec: **2 findings**, highest P2 identity/calendar validation. The ID finding overlaps across the deliberately independent axes. Review findings remain unfixed.

**Reconciliation, 2026-10-04:** review completed at `2026-10-04T04:03:10.212Z`; assistant-turn wall time **302.405 seconds**. S52 subsequently applies fixes; the findings/status above preserve the review snapshot.

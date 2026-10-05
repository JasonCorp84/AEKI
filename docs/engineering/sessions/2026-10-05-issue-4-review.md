# S71 — Full Issue #4 Review

Csaba explicitly approved `8934571d9e25f75a7ccc8259c6b1d0a8a036a5f7` to the current worktree, including untracked files. HEAD remains that commit, so the committed three-dot diff would be empty. Review used `git diff 8934571` and direct inspection of new files. No application code, test, commit or tracker status was changed.

Skill: `code-review`, reused. The skill explicitly requests independent parallel Standards and Spec sub-agents; both were run. Standards sources: AGENTS.md, engineering principles, ADR-0001 and the user-approved issue #4 plan. Spec sources: the authenticated live GitHub issue #4, accepted Mikado/test proposal and A direction record. `docs/agents/issue-tracker.md` is missing; the user was informed of the skill's setup instruction, and the known, authorized sources were used without blocking the review.

## Standards

No verified actionable standards finding. Transport, state ownership, presentation, messages and tokens remain separate; generated contracts are derived from YAML. The user explicitly authorized batch test preparation, so the historical vertical-TDD preference does not override it.

## Spec

Two P2 findings:

1. `ProductCard.tsx:13–21` derives transport precision from Intl display fractions, with only a HUF exception. The OpenAPI schema accepts other three-letter currencies and describes standard currency minor units. A read-only SSR probe used the actual runtime parser and actual card: `{amountMinor:1299000,currency:'AFN'}` was accepted and rendered `AFN 1,299,000`, rather than 12,990. The [SIX ISO currency list](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml), retrieved directly during review, records AFN and MGA minor-unit digits as 2; the pinned Node Intl displays them with zero fractional digits. This is a valid-response scaling defect outside the current HUF fixtures. Use an explicit supported precision contract or authoritative minor-unit metadata, separating scale from display rounding.
2. `SearchPage.tsx:23–36` and its introduction CSS stack desktop search under the prose. The accepted A direction record, line 12, requires search beside the introduction on desktop and stacked on mobile. The CSS never establishes desktop hero columns; its responsive grid changes concern products. Restore that responsive relationship and verify it through rendered layout checks. Deferred category/filter/sort controls are not counted as missing requirements.

These targeted observations do not replace the implementation's previously passing 167 tests, 22 search browser cases and connected database journey; no full gate was rerun during review. Passing coverage does not establish untested currency semantics or the desktop positioning requirement.

Technical recovery retries: 2 read-only data-retrieval corrections — the public GitHub page could not be fetched, so the existing authenticated helper read the issue; the first XML projection used the wrong minor-unit property, corrected by inspecting authoritative records. No test rerun or application fix is implied.

Turn start: `2026-10-05T18:59:57.042Z`; turn ID: `01a10d6f-db89-7152-b346-2a165105ae57`. Completion awaits the actual event. S70 completion reconciled to 1748.999 seconds. Human active time remains unmeasured. Both findings remain open for explicit remediation.

Follow-up: Csaba explicitly requested both fixes in S72. Both are corrected locally with observed regression RED → GREEN and full-gate/browser evidence in [the remediation record](2026-10-05-issue-4-review-fixes.md). The original review observations above are retained as history; no issue closure or merged delivery is implied.

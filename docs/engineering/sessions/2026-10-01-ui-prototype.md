# AEKI UI Prototype – Session Evidence

## Question and Outcome

Which visual hierarchy makes product discovery, local availability and comparison easiest to understand? The user invoked the `prototype` skill with its UI branch and clarified that the exploration is about UI design.

Three alternatives were delivered for comparison on `/prototype/search-ui?variant=A|B|C`: image-led catalog, compact shortlist, and room-first discovery. They use the same synthetic products, in-memory state and a shared floating variant switcher. **Csaba subsequently selected B.** See the [UI direction decision](../../design/search-ui-direction.md). The selection accepts a visual direction; it does not validate a production implementation.

Source: [prototype files and run instructions](../../../apps/web/prototype/README.md). Capture branch: `codex/prototype-search-ui`. The prototype is captured on this local branch; it has not been pushed. Production React/RTK Query implementation is a separate task after a design decision.

## Sequence and Timing

| Step | Source turn | UTC start | Result |
| --- | --- | --- | --- |
| S30 | `01a0f6d3-6d28-7d80-811a-8c57fcac760c` | `2026-10-01T09:37:26.418Z` | Skill/requirements intake; user interrupted before implementation; no completion marker |
| S31 | `01a0f6d5-91df-7e43-8cd1-61148aab31e1` | `2026-10-01T09:39:46.858Z` | Resumed UI-only exploration; three variants and browser verification |

Checkpoint at `2026-10-01T09:54:36Z`: **889.142 seconds (14:49.142)** since S31's task start. This is a delivery-preparation checkpoint, not the final response-complete timestamp. Reconcile completion from the Codex event log on the next turn. Human active time and acceptance time are unknown. The interrupted intake duration is not inferred.

The preceding measurement-setup task S29 was reconciled: completed at `2026-10-01T09:21:30.243Z`, assistant-turn wall time **597.304 seconds**. Its earlier 554.061-second delivery checkpoint remains a separate observation.

## Skills and Techniques

- `prototype`: explicitly invoked; `UI.md` branch; three structurally different layouts, a single URL-controlled route, keyboard/floating switcher, in-memory stubs and capture outside main.
- `browser:control-in-app-browser`: previously loaded guidance reused for browser rendering, interaction checks, screenshots and the mobile breakpoint.
- `tdd` and `writing-for-agents`: read during the interrupted intake, but not applied to prototype implementation. No claim of an observed TDD cycle. This is throwaway visual exploration under the prototype skill; production work remains subject to the project's engineering principles.
- Techniques: side-by-side design alternatives using common data; rendered visual inspection; desktop/mobile comparison; explicit UI-state preview; isolated prototype branch.

## Validation Evidence

- All three variants rendered in the browser with distinct information hierarchy.
- Bottom-arrow cycling updates the variant URL; keyboard cycling works outside form fields and preserves input editing inside the search field.
- Search changed from chair results to two table results; clearing search displayed the waiting view.
- Favourites toggled; a product-detail overlay opened and closed.
- Error preview displayed its message; its retry control returned to the product view.
- Relevant state is available through the State panel and is printed to the browser console on rendering.
- All three layouts were inspected at a 390-pixel mobile breakpoint without document-level horizontal overflow. The compact list retains availability and store selection on mobile.
- Server and inline JavaScript syntax checks passed after the correction below. This is browser inspection, not a production regression suite or evidence of API/database behavior.

## Recorded Recoveries and Self-Revisions

Three technical recoveries were observed during S31:

1. A browser action targeted the Discover navigation button after the mobile layout had hidden it. The visible AEKI home link was used instead: one browser-operation retry.
2. A mobile-layout edit introduced a missing quote in a JavaScript template expression. `node --check` detected the syntax error; the expression was corrected and the check passed: one syntax-validation retry.
3. A browser verification was attempted against the temporarily broken page and found no preview selector. After the syntax repair, the verification was repeated successfully: one browser-operation retry caused by the same syntax defect.

These are **three recorded retry executions, from two underlying causes**, not three rejected UI designs. Diagnostic reads are excluded. No user-requested quality correction has been received yet; the UI-only clarification is scope steering, not artifact rejection.

Two visual self-revisions followed inspection: make the room illustration visible in the first desktop viewport; retain stock information and store controls in the mobile shortlist. The prototype is not user-accepted merely because these checks passed.

## Next Review

Ask the user to compare A, B and C, including combinations of their header, search placement and product layout. Record the selected direction and reason before rewriting the UI as production React. This one task does not prove which technique or skill is most effective.

## Reconciliation and Selection – S32

S31 completed at `2026-10-01T09:57:55.783Z`, for **1,088.925 seconds (18:08.925)** of assistant-turn wall time. The earlier checkpoint remains a separate observation.

The selection-associated turn S32 began at `2026-10-01T10:30:47.832Z`; the choice was recorded at the clock observation `2026-10-01T10:31:26Z`. These do not measure the user's active review time. User evidence: “A B variaciot valasztom”. The reason was not supplied. No additional design correction was requested.

Applied skills: `prototype` (existing guidance reused to capture the selected direction) and `browser:control-in-app-browser` (reused to open and verify B). Outcome: B selected, preview opened to B, English decision document recorded. Production implementation remains a separate task.

## Subsequent direction change — S37

Csaba later selected A on 2026-10-01: “Terjunk at megis az A prototipusra.” This supersedes the earlier B decision for future implementation. The B observations above remain historical evidence. See the [current direction](../../design/search-ui-direction.md) and [direction-change evidence](2026-10-01-ui-direction-a.md).

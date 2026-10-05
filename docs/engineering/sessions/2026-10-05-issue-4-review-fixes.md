# S72 — Fix Both Issue #4 Review Findings

Csaba explicitly requested correction of both S71 findings. The existing accepted public seams are reused: real Redux/RTK Query with intercepted HTTP for displayed price, and running Chromium for desktop/mobile layout. Skill: `tdd` (reuse, including testing/mocking references). No sub-agent was used; commit, push, merge and tracker completion remain separate actions.

## Price: RED → GREEN

One new public integration regression supplies `1299000` AFN minor units through HTTP and expects a visible 12,990 price with explicit AFN code. Before the fix, the test failed because the actual card displayed `AFN 1,299,000`. After the fix, it passed (one executed case; remaining cases skipped in that targeted probe).

The card now converts transport minor units with an ISO precision snapshot before locale-aware display formatting. The compact JSON contains numeric exceptions to two-digit precision, downloaded directly from the official SIX list on 2026-10-05. Zero-, three- and four-digit exceptions are preserved; HUF/AFN/MGA retain two digits independently of Intl display rounding. No runtime download or new dependency is introduced. The provenance and refresh conditions are documented in the search-fixture guide. The permissive currency pattern still does not guarantee semantics for codes without a numeric ISO minor-unit definition.

## Layout: RED → GREEN

A new real-browser assertion compares the heading and search input's visible bounds in both configured viewports. Before the fix, desktop failed while mobile passed. After separating introduction copy and search controls into two blocks, the desktop grid puts them beside one another; at 52rem and below, the reading order stacks them. Both targeted browser cases passed. The assertion observes positions, not CSS class names.

## Verification

`npm run check` passed: 38 tooling, 41 contract, 54 frontend, eight database-tooling and 27 API tests (168 total). Native formatting, measurement validation, YAML/generated-contract drift, lint, strict types and production builds pass. All four coverage metrics remain 100% for each of 38 inventoried executable files. No threshold, exclusion or hook bypass was introduced. Historical measurement warnings remain visible.

`npm run test:search:browser` passed: 20 desktop/mobile fixture cases, three production cases and one disabled-development case (24 total, no automatic retries). Search visibility, keyboard access and absence of horizontal overflow remain verified. The source changes affect product price/rendering and scoped layout, not health/readiness transport; the full gate preserves real database integration coverage.

Technical recovery retries: **1** — an ADR documentation patch did not match its expected phrase; rereading the exact line allowed the patch to apply. The observed AFN and desktop REDs are expected regression reproduction; subsequent GREEN runs are the planned TDD cycle, not unexpected recovery attempts. No user-requested scope change or new seam is introduced.

Turn start: `2026-10-05T19:05:41.378Z`; turn ID: `01a10d75-1cb2-76d0-84ff-2d165f59609f`. Completion awaits the actual event; human active time remains unmeasured. S71 completion reconciled to 335.561 seconds from its event.

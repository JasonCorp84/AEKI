# Mikado Plan — Issue #4: Contracted Search in the A Layout

Date: 2026-10-05. Status: **approved and implemented locally; delivery acceptance pending**.

Csaba explicitly accepted the complete test proposal and requested implementation in S70. The approved nodes are implemented on `codex/product-search-fixtures`; [implementation evidence](../engineering/sessions/2026-10-05-issue-4-implementation.md) records verification. This status does not close the GitHub issue or imply a commit, push or merge.

Execution checkpoint: Csaba subsequently authorized starting with the test and explicitly accepted all three public test seams. The first contract-parser RED is recorded in [S67–S68](../engineering/sessions/2026-10-05-issue-4-first-red.md). Broader proposed design decisions are not silently treated as accepted by the seam agreement.

Source: [GitHub issue #4](https://github.com/JasonCorp84/AEKI/issues/4), fetched on this date. Its current title is **[React] Search in the A layout through contracted HTTP fixtures**. Earlier B titles in dependency text are historical references; A is the accepted visual direction.

## Goal and why now

**G:** A user searches by product name or article number in the selected A catalog layout. The real Redux store and RTK Query client receive runtime-validated HTTP fixtures. The page handles waiting, loading, results, empty results and recoverable failure, without showing an old query's results as current.

Issue #1, the only explicit blocker, is closed. Csaba requested closure of #3 as completed and selection of the next existing project issue. This planning task replaces that delivery as the current AEKI work; it does not add a cross-project priority. Issues #5 and #6 depend on #4; real product persistence remains #7.

The #3 review's two P2 findings remain unresolved: lost startup diagnostics and unbounded migration startup. Closing #3 does not establish their correction. Their evidence remains in [S65](../engineering/sessions/2026-10-05-issue-3-review.md). Keep their fix separate from product-search scope; recheck the current PR/main state before implementation.

## Inspected baseline

- Local HEAD at planning: `8934571` (`code review findings`); the working tree was initially clean. Before implementation, revalidate main, PR #18 and any uncommitted work; do not assume an issue closure merged its PR.
- `contracts/openapi.yaml` currently describes health and readiness, not product search. Extend this YAML source and regenerate types; never edit generated output.
- `apps/web/src/app/api.ts` already owns the base RTK Query API and HTTP timeout. Reuse it rather than creating another cache/store.
- Existing health/readiness features demonstrate real Redux-provider tests with MSW HTTP interception and messages passed to presentational components.
- `shared/theme/tokens.css` already has semantic colors and spacing. Extend roles through concrete UI needs rather than embedding palette literals in cards.
- MSW is already installed for tests. Browser-worker startup and an explicitly gated development mock mode still need implementation.
- The preserved `apps/web/prototype/search-ui.prototype.html` and [direction record](../design/search-ui-direction.md) supply visual evidence; their synthetic behavior is not production code.
- ADR-0003 is proposed. This issue must preserve replaceability, while light/dark/palette switching and Hungarian/English switching remain #5/#6. Do not silently mark the entire ADR accepted.

## Proposed decisions for approval

1. **Transport:** add `GET /products?query=...` with one trimmed, whitespace-normalized search string. Preserve article-number leading zeros. Fixture matching is case-insensitive against name or article number, with deterministic ordering. Propose `items` as the response collection and a stable machine-readable error code. Document the exact DTO, required fields, success/empty/error examples and limits before generating types.
2. **Card contract:** include product identity, image reference/alternative text, name, article number, description, price with explicit currency, and stock associated with an explicitly identified fixture store. Propose integer minor units for money and locale-aware formatting. Use local fixture images. Store selection, lookups, filtering, sorting and pagination remain later tickets.
3. **Presentation:** one initial light mode and English interface, consistent with the existing foundation. Search messages live behind typed resource keys; card text and price/stock formatting are separate from transport. A's warm introduction and image-led grid guide the layout. Exclude decorative category/filter/sort/favourite controls until their behavior is implemented.
4. **State:** local input draft becomes a normalized applied query after 300 ms. Whitespace immediately clears visible results and cancels pending application. RTK Query owns products. Render only data belonging to the current normalized criteria; retry targets those criteria. Theme and interface language never enter a presentation-only query key.
5. **Development boundary:** one documented command explicitly enables MSW fixtures and awaits worker startup before rendering. Worker import/start is guarded by development mode and explicit opt-in. Production has no fixture fallback. Keep the existing real health/readiness browser journey available; agree the minimal route/composition change during the first implementation probe instead of inventing a routing framework here.

## Mikado nodes and keep conditions

| Node                                  | Smallest attempt after approval                                                               | Keep only when                                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| M0 — Protect baseline                 | Inspect branch/main/PR, actual scripts and selected A reference; isolate #4 implementation    | Existing CI, review evidence and prototypes are preserved; scope and test seams are approved                                             |
| M1 — Contract                         | Specify one search operation, card DTO, error codes and independent examples in YAML          | Validation, generated types and runtime parsing agree; malformed data is rejected                                                        |
| M2 — Runnable HTTP fixture            | Start MSW through explicit development opt-in; use contract-conforming deterministic fixtures | One command runs the journey; real RTK Query issues HTTP; production never falls back to fixtures                                        |
| M3 — First search tracer              | One RED test for name/article search through actual providers; minimum GREEN search/grid      | Input, request, response validation and rendered cards cooperate                                                                         |
| M4 — Timing and query ownership       | Separate RED/GREEN slices for 300 ms, whitespace clearing and delayed old response            | No early request, no whitespace request and no stale results presented as current                                                        |
| M5 — States and recovery              | Separate slices for waiting/loading/empty/error/retry and malformed response                  | Accessible state labels are explicit; retry uses current criteria; invalid data is not rendered                                          |
| M6 — A layout and reusable boundaries | Add only used primitives, card/view model and responsive styling                              | Desktop/mobile retain readable image/name/article/price/store-stock; keyboard focus works; styles use tokens and text uses resource keys |
| M7 — Verification and handoff         | Run full existing gates, fixture-mode browser checks and inspect normal production mode       | Four per-file coverage metrics remain 100%; fixture boundary is documented; evidence and timings are recorded                            |
| G — Accepted #4 delivery              | Review against every issue criterion                                                          | Csaba accepts delivery before issue completion                                                                                           |

Proposed order: **M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → G**. M4/M5 expand a working tracer through one test and one minimal implementation at a time. Dependencies are hypotheses until observed, not claims that the work has already passed. See the [separate graph](diagrams/issue-4-mikado.md).

## Proposed public test seams

The reused `tdd` skill requires explicit agreement before writing tests. Approval of this plan is intended to approve these three seams:

1. **OpenAPI and runtime transport boundary:** independently specified request/response examples pass validation; malformed success/error payloads are rejected. Generated output stays aligned with YAML.
2. **User interaction → real providers/store/RTK Query → intercepted HTTP:** verify query normalization, request timing at 299/300 ms, whitespace clearing, name/article results, current-query ownership under a delayed old response, empty/error/invalid states and retry. Do not mock hook return values or component internals.
3. **Running frontend development/production boundary:** a real browser verifies the fixture-mode search journey, desktop/mobile keyboard interaction and required card content. Production configuration demonstrably does not start fixtures or silently invent products. Preserve the existing connected health/readiness check.

HTTP fixtures establish frontend cooperation and contract compatibility; they do **not** establish Nest product matching, SQL correctness, real inventory or backend performance. Those guarantees belong to #7 and later real-data journeys.

## Undo and delivery policy

Keep each probe small. If a dependency fails, record the observation and undo only its owned experimental changes. Do not change prototypes, relax coverage, bypass hooks or rewrite unrelated code to make a probe green. New executable application modules remain in the existing coverage inventory. Use native Prettier with the existing configuration.

Before delivery, record actual RED/GREEN output, full checks and browser evidence, technical retries separately from expected REDs, skill usage and actual turn timestamps. Review the page if transport, formatting and rendering become one responsibility. No new code, test, package or ADR acceptance is authorized by publishing this proposed plan alone.

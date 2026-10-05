# Issue #4 — Test Suite for Approval

Status: **explicitly accepted by Csaba; implemented locally in S70**. The original proposal below preserves the write-only preparation boundary: no application implementation, YAML endpoint or generated contract was changed during that preparation. Csaba's subsequent “Elfogadva. Implementald” authorizes implementation and test execution. See [implementation evidence](../engineering/sessions/2026-10-05-issue-4-implementation.md) and the [Mikado plan](issue-4-mikado-plan.md).

Csaba accepted all three public seams, then explicitly requested all tests before implementation. This instruction overrides the TDD skill's usual one-test/one-implementation ordering for this preparation step. After the assistant ran preliminary RED checks, Csaba clarified that this step is **writing tests only, without running them**. No further test executions are authorized by this proposal. Review the expected behavior below before the implementation stage.

## Proposed suite

| Public seam                                    |                                Cases | File                                                    | Observable behavior                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | -----------------------------------: | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runtime transport parsing                      |                                   25 | `packages/api-contracts/src/product-search.test.ts`     | Valid and empty results; zero price/stock; leading-zero article number; required image/description/price/store fields; invalid collection, missing data, negative/fractional amounts and unknown fields; stable error codes and rejection of arbitrary error data                                                                    |
| Documented HTTP contract                       |                                    2 | `scripts/product-search-openapi.test.mjs`               | Required name/article query, nonempty string transport input, documented success/empty/503 examples conforming to schemas                                                                                                                                                                                                            |
| User → real Redux/RTK Query → intercepted HTTP |                    22 proposed cases | `apps/web/src/features/products/ui/SearchPage.test.tsx` | Waiting; whitespace normalization; leading zeros; 299/300 ms; debounce restart/cancellation; immediate clearing; loading; required card data; no results; transport/service retry; edited-criteria retry; malformed JSON/HTML/error response; old-result hiding; delayed response/clear races; zero stock; replaceable message label |
| Running fixture-mode frontend                  | 18 browser cases, 9 on each viewport | `e2e-search/fixture-search.spec.mjs`                    | Actual development fixture mode; name/article/case matching; deterministic ordering; empty and cleared input; images and required price/store content; keyboard focus; mobile/desktop bounds; semantic token replacement                                                                                                             |
| Production frontend boundary                   |                      3 browser cases | `e2e-search/production-search.spec.mjs`                 | No mock worker even with fixture flag set; real HTTP failure with no catalog fallback; rendered data comes from the supplied HTTP response                                                                                                                                                                                           |
| Development without opt-in                     |                       1 browser case | `e2e-search/disabled-fixtures.spec.mjs`                 | Explicit false fixture flag starts no worker and supplies no product fallback                                                                                                                                                                                                                                                        |

Total: **71 proposed executable cases**. The React count includes parameterized network/service and JSON/HTML cases, but its suite cannot currently load the missing application modules. Test case counts are not a coverage percentage or successful execution claim.

## Behavior and interface decisions to review

- Proposed public parsers: `parseProductSearchResponse` and `parseProductSearchErrorResponse`, exported through the contracts package. Invalid input throws the explicit boundary error; no application stack or server message is user-facing.
- Proposed operation: `GET /products?query=...`, operation ID `searchProducts`; success `{items: [...]}`; recoverable HTTP 503 `{code: 'PRODUCT_SEARCH_UNAVAILABLE'}`. YAML success examples are named `results` and `empty`.
- Proposed product DTO: `id`, `name`, string `articleNumber`, `description`, `image: {url, alt}`, `price: {amountMinor, currency}`, `stock: {storeId, storeName, quantity}`. Required fields and unknown-field rejection are asserted; price and quantity are nonnegative integers. No article number conversion to a number.
- Proposed development examples: LINDEN chair (`00012345`, HUF 12,990, Budapest stock 7) and BJORK table (`00098765`). Name/article matching is case-insensitive substring matching; a broad article fragment `0` returns both in deterministic name order. Description matching is not introduced.
- Proposed public page: `/search`, component `SearchPage`, replaceable typed `messages` prop and `searchLabel` key. The test proposes `features/products/ui/SearchPage.tsx` and `features/products/model/search.messages.ts`; these are not existing modules.
- Accessible labels proposed in tests: `Search products`, `Retry search`; product articles use their name. Visible states: `Search for a product`, `Searching products…`, `No products found`, `Product search failed`, `Invalid product response`. Fixture mode identifies itself as `Development fixtures`.
- Zero stock is visibly reported as `0 available` with the identified store and indicative-stock text. English price formatting retains explicit HUF currency. Language and palette selectors remain #6/#5, respectively.
- Race tests observe the network boundary and accept cancellation as well as late response handling; they do not demand a particular Redux implementation or mock query hooks.

These details are part of the **test proposal**. Approval of the three seams alone did not implicitly accept these DTO field names, UI labels or fixture literals. Changes requested during review are design refinements, not failed implementation retries.

## Harness and scope limits

Separate Playwright configurations preserve the existing real health/readiness suite:

- `playwright.search.config.mjs`: owned Vite development server on loopback port 4350, explicit fixture flag, desktop 1280×900 and mobile 375×812.
- `playwright.search-production.config.mjs`: owned built preview on 4351 with the flag deliberately enabled to test production exclusion.
- `playwright.search-disabled.config.mjs`: owned development server on 4352 with the fixture flag explicitly false.

All refuse existing servers, use one worker/no retries and write failure artifacts to separate ignored subdirectories. Production boundary cases intercept HTTP intentionally; they prove selection of that transport rather than mock fallback, **not real Nest/SQL matching**. Existing connected browser CI remains unchanged. No package script, CI job, coverage exclusion or threshold was modified for the proposed suites.

The default contract/tooling/frontend discovery will encounter intentional incomplete-feature failures until implementation. The search browser suites are separate from the existing `e2e/` discovery. Do not publish this preparation as a green delivery or weaken the 100% per-file gate to accommodate RED.

## Already observed before the user's execution correction

The assistant unnecessarily executed checks during this write-only request. These are recorded honestly, not required approval evidence:

- Parser suite: 25 failures because the two public parsers do not exist.
- OpenAPI suite: two failures because `GET /products` does not exist.
- React suite: import/collection failure at missing `SearchPage`; **zero behavior cases executed**.
- Browser discovery: 18 fixture cases + 3 production cases + 1 disabled-fixture case listed.
- One actual fixture browser case failed while waiting for the absent development-mode label; screenshot and trace were produced in ignored test storage. Its product assertions were not reached.
- Native formatting and JavaScript harness lint/syntax checks passed for the files examined before the correction. No full type check, coverage result, full browser run or green application claim is made. No more tests are run after the correction.

## Approval checklist

- [ ] Required issue behavior and the proposed examples/labels/DTO are correct.
- [ ] Test boundaries observe public behavior and the HTTP/clock seams only.
- [ ] Fixture evidence is clearly separate from real product API/database evidence.
- [ ] Tests may be implemented against, following Csaba's chosen execution policy.

Await explicit approval; no automatic acceptance, commit or push.

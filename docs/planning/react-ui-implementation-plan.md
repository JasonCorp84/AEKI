# React UI Implementation Plan

Date: 2026-10-01. Status: proposed implementation and ticket breakdown; awaiting review. Linear remains canonical for approved work, dependencies and status. This document is a review artifact, not a second backlog.

## Scope and starting point

Build the production search UI using React, strict TypeScript and Redux Toolkit / RTK Query. Use [B — Practical shortlist](../design/search-ui-direction.md) as the visual reference. Leave the existing throwaway prototype unchanged.

The user requires reusable UI, SOLID boundaries, replaceable themes and replaceable interface language. These requirements are accepted; the implementation choices and ticket granularity below are proposals. Initial language proposal: Hungarian and English. Initial theme proposal: light and dark under the AEKI palette, plus a second palette to demonstrate replacement. This does not promise automatic translation of product catalog content.

Start with one working search journey. Grow the shared design primitives through actual feature use. Authentication, reservations, favourites, realtime inventory, deployment and notification microservices are outside this first UI delivery. A control shown in the prototype is not automatically an implemented feature.

## User experience

- Desktop: compact header and search, filter sidebar, product rows with aligned price and selected-store availability.
- Mobile: stacked product information with visible price and stock, an accessible expandable filter panel, and no document-level horizontal scrolling. Filter access remains available when the desktop sidebar disappears.
- Search states: waiting for input, loading, current results, no results, recoverable request failure. Distinguish an initial request from a subsequent refresh. Never present a previous query's rows as matches for the current query.
- Each product row exposes image, name, article number, description, price and selected-store availability. Product details use a shareable route and return to the search criteria.
- Theme and language selectors are available through the application shell. Both settings preserve search, store, filters, sort and current page.
- Visible labels, keyboard operation, clear focus, status announcements and errors conveyed through text are acceptance requirements. Stock is indicative; a future reservation operation is authoritative.

## Architecture and data ownership

Use a feature-oriented frontend with a small reusable UI layer. The composition root assembles application providers; features own their product-specific behavior.

| Concern | Owner | Boundary |
| --- | --- | --- |
| Server products, stores, categories, stock | RTK Query cache | OpenAPI transport contract and validated HTTP responses |
| Applied search criteria | URL | Parsed, validated criteria; browser Back/Forward is supported |
| Input being edited, open filter panel | Local React state | User input becomes applied criteria after validation/debounce |
| Theme mode and palette | Theme provider | Semantic token contract and preference storage adapter |
| Interface language | Localization provider | Typed translation keys and locale-aware formatters |
| Visible product representation | Feature mapper | Validated DTO becomes a small view model |
| Rendering and interaction | Presentational components | Narrow props, labels and callbacks; no direct HTTP access |

Do not duplicate RTK Query results in an ordinary Redux slice. Do not put theme or locale into the product query key when they only change interface presentation. A future translated catalog API would need a separate explicit locale contract and cache policy.

Proposed structure, extending the existing architecture proposal:

```text
apps/web/src/
  app/                   # composition, routing, store, base API, providers
  features/products/
    api/                 # product endpoints and validated transport mapping
    model/               # criteria parsing, view models, feature hooks
    ui/                  # search page, product rows, filters, details
  shared/
    ui/                  # Button, TextField, Select, status and layout primitives
    theme/               # token contract, palettes, mode, provider
    i18n/                # resources, typed keys, provider, formatters
    preferences/         # small storage adapter and validated parsing
contracts/openapi.yaml   # HTTP source of truth
packages/api-contracts/  # generated transport types and schema tooling
```

Keep tests beside the behavior they verify. Shared UI must not import product features. Create a separate design-system package only when another application actually needs it. Avoid a universal configurable component with dozens of unrelated options.

### Reusable design and theme contract

Use CSS custom properties for semantic roles: canvas, surface, text, muted text, border, primary action, text on primary action, focus, success, warning and error. Also centralize spacing, type scale and radii. Components reference roles, never a specific palette's color literals.

Separate **mode** (light/dark) from **brand palette**. A theme definition supplies complete values for every role in each supported mode. A new palette is registered without changing product components. Changing a primary color must not silently change success/error meanings. A palette is supported after readability and interaction states have been checked; arbitrary color input alone cannot guarantee a usable theme.

The provider owns selection, applies tokens at the root and persists preferences through an adapter. Validate stored data and fall back to a supported default if storage is malformed or unavailable. Initial behavior: use the saved mode, otherwise follow system preference; an explicit user selection takes precedence. Apply the initial theme before the first visible render where feasible to avoid a flash of the wrong theme.

Proposed styling: CSS Modules for component styles plus global semantic tokens. Advantage: direct, inspectable theme behavior with little tooling. Cost: variants and consistent styling conventions must be maintained by the team. Tailwind is an alternative if utility composition becomes a concrete need; it does not remove the token contract.

### Replaceable interface language

Proposed implementation: i18next with react-i18next, isolated behind the application localization setup. Use feature namespaces, typed keys and a shared resource shape. New components require matching Hungarian and English entries; missing keys and placeholder mismatches fail validation rather than shipping raw keys.

Use translations for visible text, accessible names, placeholders, stock labels and error messages. Support pluralization and interpolation instead of concatenating sentence fragments. Set the document language when the locale changes. Missing or unsupported persisted locale falls back to the configured default.

Format numbers and prices with `Intl` using the selected locale and the product's explicit currency. Changing locale changes formatting, not price, currency or store. Backend failures expose stable codes which the UI maps to localized messages; raw server prose is not the interface-language contract. Product names and descriptions remain supplied catalog content in this scope.

Advantage: the same feature UI supports another language through resources and formatting. Costs: translation coverage, longer text layouts and language-specific review become continuing work. A hand-written dictionary is a smaller alternative, but would require us to maintain pluralization, fallback and resource typing ourselves.

### SOLID in the frontend

| Principle | Concrete application | Review check |
| --- | --- | --- |
| SRP | Page composes; hook manages search; mapper shapes data; provider owns preferences; row renders | A product row neither fetches nor persists settings |
| OCP | Add a complete palette or language resource through its defined contract | Existing product components remain unchanged |
| LSP | Theme definitions and shared component variants preserve required behavior | Every supported variant preserves focus, disabled behavior, labels and readable states |
| ISP | ProductRow takes only the fields and callbacks it uses | No whole Redux store or unrelated reservation service in props |
| DIP | Presentational UI consumes view models and callbacks; settings use storage through a narrow seam | Tests can substitute network/storage at boundaries without replacing component behavior |

Use functions, props and composition where sufficient. Introduce ports at actual external boundaries; do not add an interface and class for every component. TypeScript contracts also require runtime parsing for HTTP, URL and storage input.

## Proposed implementation slices

The order numbers are draft references, not Linear issue IDs. Each slice includes its tests and documentation. A frontend-only preference has no database requirement; do not invent backend persistence just to add layers. The first slice intentionally validates frontend integration against contracted HTTP fixtures; slice 4 establishes the real full-stack path.

### 1. Search in the B layout through contracted HTTP fixtures

**Blocked by:** None.

**Why now:** Turn the selected layout into the smallest runnable, testable React journey and establish the HTTP boundary before building more features.

**What to build:** A user searches by product name or article number and receives compact product rows through the real RTK Query client and an intercepted HTTP endpoint in development/test. Include the application setup and only the shared controls this journey needs. Render through semantic tokens and translation keys from the start, initially with one mode and locale.

**Acceptance criteria / Definition of Done:**

- [ ] One documented startup command runs the React search page with an explicitly identified development mock mode.
- [ ] The initial product-search operation and success/error examples exist in the validated OpenAPI contract; fixtures conform to it.
- [ ] Input is normalized; whitespace clears results and issues no search; the 300 ms debounce is observed.
- [ ] Waiting, loading, results, empty and error states are visible; retry uses current criteria.
- [ ] A deliberately delayed old response cannot replace the current query's results.
- [ ] Desktop and mobile preserve the B information hierarchy and accessible search interaction.
- [ ] TDD evidence and an integration test exercise the actual providers, Redux store, RTK Query and mocked HTTP. Hook return values are not mocked.

**Review trigger:** If the search page combines transport, formatting and rendering, refactor its responsibilities before expanding it. This slice does not establish real backend behavior.

### 2. Switch theme without losing the search

**Blocked by:** 1.

**Why now:** Prove that reusable design works on an existing journey before adding more screens.

**What to build:** Switch the working search page between light/dark and two registered palettes, preserving all search state. Persist the selection locally with a safe fallback.

**Acceptance criteria / Definition of Done:**

- [ ] The same product components render every supported mode/palette without palette-specific conditionals or color literals.
- [ ] Text, action states, borders, stock states and keyboard focus remain readable in each combination.
- [ ] Mode and palette are separate choices; a second palette requires only a definition and registration.
- [ ] Reload preserves an explicit preference; malformed or unavailable storage safely uses defaults.
- [ ] Switching settings does not issue a product refetch or reset results/criteria.
- [ ] Integration checks cover preference persistence/fallback and preserved search; browser inspection covers contrast, focus and initial appearance.

**Review trigger:** A theme that needs feature-specific overrides signals an incomplete semantic token contract.

### 3. Switch interface language without losing the search

**Blocked by:** 1. Theme switching is not a prerequisite.

**Why now:** Validate translation boundaries while the interface is small.

**What to build:** Switch the search page between Hungarian and English, including statuses, accessibility labels, errors and price formatting, with a persisted preference.

**Acceptance criteria / Definition of Done:**

- [ ] All current interface strings have typed keys and both language resources, including loading, empty and retry states.
- [ ] Missing keys and invalid interpolation placeholders fail the agreed resource check.
- [ ] Document language, pluralized result counts and number/currency formatting follow the selected locale.
- [ ] Product data and currency are preserved; no implied catalog translation occurs.
- [ ] Selection survives reload; invalid storage safely falls back; changing language preserves search and does not refetch interface-only data.
- [ ] Integration tests exercise a language switch in results and failure states; mobile inspection uses the longer translated labels.

**Review trigger:** Adding a language requires feature logic changes, or server prose becomes a displayed error contract.

### 4. Search actual products through NestJS and PostgreSQL

**Blocked by:** 1. A reachable local PostgreSQL test instance is an environment prerequisite. Slices 2 and 3 do not gate this work.

**Why now:** Replace fixture assumptions with an early real integration while the journey remains narrow.

**What to build:** The same user search reaches the agreed NestJS endpoint, reads seeded PostgreSQL products and returns a validated result to the unchanged UI.

**Acceptance criteria / Definition of Done:**

- [ ] A migration and deterministic seed make the existing name/article search reproducible.
- [ ] Requests and success/error responses match the existing OpenAPI operation; invalid transport data is rejected at the agreed boundary.
- [ ] Name/article matching follows the agreed case-insensitive behavior and stable result ordering.
- [ ] A browser search reaches the real API and database; no mock handler or fallback supplies the result.
- [ ] HTTP/database integration checks and a focused real-browser E2E verify results and no-results behavior.
- [ ] Production configuration does not enable development mocks; the HTTP contract remains the same in both modes.

**Review trigger:** Mock and actual endpoint semantics differ; resolve the contract before adding filtering.

### 5. Filter real results and restore criteria from the URL

**Blocked by:** 4.

**Why now:** Make the selected desktop sidebar and mobile filter control useful with actual inventory data.

**What to build:** Select category, store, price range and available-only conditions; the server returns matching products, and sharing or navigating the URL restores the same criteria.

**Acceptance criteria / Definition of Done:**

- [ ] Filter input and category/store lookup operations are described in OpenAPI; the necessary catalog/stock seed is present.
- [ ] Backend queries apply filters before limiting results; availability is tied to the selected store.
- [ ] Negative prices and inverted ranges show localized input errors and do not issue invalid requests.
- [ ] URL parsing validates input; Back/Forward restores applied criteria; changed criteria reset the page to 1.
- [ ] Desktop and mobile permit the same actions, including clearing filters and changing store.
- [ ] Integrated UI checks cover URL/input/request cooperation; a real end-to-end example confirms store-specific filtering.

**Review trigger:** Distinguish local draft input from applied URL state if navigation produces stale requests or overwritten input.

### 6. Sort and paginate filtered results consistently

**Blocked by:** 5.

**Why now:** Keep the compact shortlist usable beyond the first result page.

**What to build:** Sort by name/price and page through server results, retaining all current filters and shareable criteria.

**Acceptance criteria / Definition of Done:**

- [ ] OpenAPI describes sorting, page parameters and totals; default page size is 20 with a maximum of 50.
- [ ] Backend sorting has a stable product-ID tie-breaker and pagination occurs after filtering and sorting.
- [ ] URL and page controls agree; new search, filters or sort reset the page to 1.
- [ ] Only the response for current complete criteria is shown; empty/out-of-range pages have a defined recovery path.
- [ ] Integration tests verify query transitions; a seeded real-data example verifies equal-price ordering across pages.

**Review trigger:** Page metadata and rows disagree or repeated prices make pagination unstable.

### 7. Open product details and return to the search

**Blocked by:** 4. Filtering/pagination are not prerequisites.

**Why now:** Complete the search-to-product journey without bringing reservation workflows into the first UI scope.

**What to build:** Open a shareable product-detail route with description, category, price and selected-store stock, then return to the preserved search.

**Acceptance criteria / Definition of Done:**

- [ ] OpenAPI defines the product detail operation and not-found response; seeded data supports the detail journey.
- [ ] Direct links, loading, failure/retry and 404 states work with the real API.
- [ ] Back navigation restores criteria; stock is clearly presented as indicative.
- [ ] The screen uses existing UI primitives, tokens and translation resources; it supports both locales and registered themes once slices 2/3 land.
- [ ] A real end-to-end search → details → return scenario passes; localized states and keyboard navigation are verified.

**Review trigger:** Details introduce a parallel theme/translation mechanism or copy the search transport logic.

## Delivery and verification policy

Recommended frontier after slice 1: 2, 3 and 4 are unblocked independently. For interview preparation, finish 2 and 3 first to prove the frontend design, then connect the real backend. This preference is not a false dependency. Slice 7 may follow 4 independently of 5/6.

For each behavior, agree its public test boundary, observe RED, implement the minimum GREEN, then refactor. Proposed tooling: Vitest, React Testing Library and MSW for frontend integration; a small Playwright suite for real browser/API/database journeys. Version selection and setup are part of the first slice, not already completed work.

Unit tests cover meaningful pure logic such as criteria parsing. Integration tests cover components, providers, URL transitions and actual RTK Query behavior together. Real E2E checks establish the cross-system journey. Mocked HTTP tests cannot demonstrate database correctness. Test theme readability in a browser; token-shape tests alone do not demonstrate readable design.

The initial release exit condition is all seven accepted slices, consistent theme/locale behavior across search and details, valid contracts, successful relevant checks, and documented real versus mocked verification. Ticket completion and priority changes are recorded in Linear after approval.

## Decisions and review

Record the theme/localization boundary in a dedicated ADR before implementation. The proposed ADR is linked below; engineering principles and integration/E2E policy continue to come from ADR-0001 and ADR-0002. C4 retains system/container/component context; this plan documents frontend responsibilities and delivery order.

Publication checkpoint: review slice size, blockers and merge/split choices. No issues have been created by this planning task. A Linear project named AEKI and a `ready-for-agent` label were not found by exact-name searches; resolve the destination and label before publishing approved tickets. Do not treat that search as proof that no suitable project exists under another name.

## References

- [ADR-0003: Theme and localization boundaries](../architecture/adr/0003-frontend-theme-and-localization.md)
- [Redux: Writing Tests](https://redux.js.org/usage/writing-tests) — real store/provider integration and network-boundary mocks.
- [react-i18next: useTranslation](https://react.i18next.com/latest/usetranslation-hook) — translation and locale-change integration.
- [MDN: CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties) — reusable style values through variables.

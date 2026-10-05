# Contracted Product Search

## Run the development journey

From the repository root, use the pinned Node/npm versions and installed lockfile dependencies:

```sh
npm ci
npm run dev:search
```

The command builds the contracts and starts Vite in the explicitly opted-in `search-fixtures` mode, opening `/search`. The default URL is `http://127.0.0.1:5173/search`; configured `WEB_PORT` can change it. No Docker, Nest product endpoint or production credentials are needed for this frontend fixture journey. The visible **Development fixtures** label identifies the data source.

Try `LINDEN`, `00012345`, `BJORK` or a query with no matches. Matching is case-insensitive by name/article number, whitespace is normalized and leading zeros are preserved. After 300 ms, the actual RTK Query HTTP client receives contracted MSW responses. Stock belongs to the named fixture store and remains indicative.

`npm run dev` continues to run the real health/readiness stack. Search is also available at `/search`, without a product fixture fallback in ordinary development or production. Real product persistence arrives in #7. The navigation's connection-status link retains the foundation page at `/`.

An explicitly false `VITE_ENABLE_MOCKS` flag disables fixtures even in the fixture serving mode. Production never registers the worker. Regenerate the worker for an MSW upgrade with the installed CLI; do not manually edit its generated logic.

## Verify the agreed boundaries

```sh
npm run check
npm run test:browser
npm run test:search:browser
```

`check` includes formatting, measurements, OpenAPI validity/drift, lint, strict types, all unit/integration coverage and production builds. All four metrics remain required at 100% per inventoried executable file. Browser evidence complements these percentages.

The original browser command still uses a real isolated PostgreSQL/Nest/React journey. Search browser tests use separate owned servers at loopback ports 4350–4352: actual fixture worker on desktop/mobile, built production with the mock flag deliberately true, and development with it false. All refuse existing servers and use one worker/no retries. Failure artifacts have separate ignored directories under `test-results/`.

Product production-boundary browser tests deliberately intercept HTTP to establish absence of fixture fallback and rendering from the supplied response. They do not establish the real Nest product operation. Frontend integration tests use real providers/store/RTK Query with MSW only at HTTP. Four exact-clock tests use public DOM change events because Testing Library's user-event wrapper requires a Jest timer drain not supplied by Vitest; other interaction and keyboard tests remain user-driven.

## Responsibilities and extensions

### Currency units

`model/currency-minor-unit-exceptions.json` is a local snapshot of the numeric minor-unit exceptions to the two-digit default, retrieved on 2026-10-05 from the [official SIX ISO 4217 currency list](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml). It includes zero-, three- and four-digit currencies. HUF, AFN and MGA use two transport digits even when Intl hides their display fractions. The card converts integer minor units with this metadata, then uses Intl only for locale-aware display. No currency metadata is downloaded at application runtime.

When a currency standard changes, refresh the snapshot and retain independent examples for transport-to-display conversion. Codes without a numeric ISO minor-unit definition are not established as supported by this snapshot; the transport schema's permissive three-letter pattern does not prove valid currency semantics.

### Responsive hierarchy

The introduction and search controls are separate blocks in a desktop two-column hero. At 52rem and below they stack in reading order. Browser assertions verify the relative heading/input positions on both desktop and mobile, in addition to overflow, visibility and keyboard interaction.

- `features/products/api`: runtime-validates success and documented error transport.
- `features/products/model`: current criteria, debounce and typed language resources.
- `features/products/ui`: accessible composition and product cards using semantic tokens.
- `mocks`: development-only HTTP fixtures and external worker setup.
- `app/Application`: minimal entry-path composition, with replaceable shell messages.

Theme and language variation must preserve these boundaries; #5/#6 add switching. Product data remains in RTK Query. Do not expose raw backend errors or convert article numbers to numeric input. [ADR-0009](../architecture/adr/0009-contracted-product-search-fixtures.md) records this slice's accepted choices without accepting the broader proposed theme/localization implementation.

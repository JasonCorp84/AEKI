# AEKI Search UI Prototype

**Throwaway UI exploration.** Question: which visual hierarchy makes product discovery, local availability and comparison easiest to understand?

The application has no existing page or component library. This standalone development route uses plain HTML/CSS/JavaScript next to the planned web application. It evaluates appearance and hierarchy; it does not implement the production React/RTK Query, API or database architecture.

Run from the AEKI repository root:

```sh
node apps/web/prototype/server.mjs
```

Open `http://127.0.0.1:4320/prototype/search-ui?variant=A`.

| Variant | Structure | Design question |
| --- | --- | --- |
| A — Everyday catalog | Warm introduction, filter sidebar, image-led product grid | Does a familiar shopping layout make discovery easiest? |
| B — Practical shortlist | Utility sidebar, compact product rows, price and availability columns | Is a comparison-first layout more useful? |
| C — Room-first discovery | Illustrated room, featured product and a supporting shortlist | Does context help users choose a product? |

Switch with the floating bottom arrows or keyboard left/right outside form fields. The `variant` URL parameter survives reload. Search, category, store selection, availability, sorting, favourites and the product detail overlay are in-memory visual stubs. The store selection changes the label, not the synthetic stock data. Room tabs change the featured item, not the static room illustration.

The toolbar can preview results, waiting, loading, empty and error layouts. Its State control displays the relevant state; it is prototype tooling, not part of the product UI. External Google Fonts are optional; system fonts are the fallback. Furniture illustrations are local SVG markup.

No persistence or real mutations. Browser inspection verifies that the prototype is usable for comparison; production behaviors still require the agreed contracts, TDD and integration/E2E checks. The development server refuses to run with `NODE_ENV=production`.

Capture on branch `codex/prototype-search-ui`. Verdict: awaiting user comparison. Once a direction is chosen, record the decision, rewrite the winner as production React and archive the alternatives on the prototype branch. Do not promote the throwaway code directly to the main application.

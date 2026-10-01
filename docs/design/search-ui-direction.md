# Search UI Direction – A: Everyday Catalog

**Status:** selected by Csaba on 2026-10-01. This is a visual direction decision, not acceptance of a production implementation.

## Decision

Use prototype **A — Everyday catalog** as the design reference for the AEKI search page. User evidence: “Terjunk at megis az A prototipusra.” (“Let's switch to prototype A after all.”). This supersedes the earlier B selection. The user's reason was not stated; do not infer a usability result from the selection.

Preserve these defining characteristics:

- An image-led product-card grid with a warm introductory section.
- Prominent search beside the introduction on desktop, stacked accessibly on mobile.
- Category shortcuts above the catalog, with store and availability controls in a desktop sidebar.
- Each card groups the product image, name, description, price and selected-store availability. Keep article number accessible in the production version to meet the search requirements.
- Result count and sorting above the grid; mobile cards retain readable price and stock labels.
- Responsive filter access when the desktop sidebar collapses. The introductory content must not make mobile search difficult to reach.

The initial warm palette is a visual reference, not hardcoded branding. Production theme and interface language remain replaceable. Decorative prototype controls such as favourites, material text and room navigation do not expand the agreed feature scope.

## Decision history

B was selected earlier on 2026-10-01 and informed the first implementation-plan and ticket drafts. A was selected later on the same date and is now the current direction. Keep earlier engineering evidence as history; update current requirements rather than rewriting the old observations.

## Reference and Implementation Boundary

The primary prototype is captured on `codex/prototype-search-ui`, initially in commit `41a3002`, under `apps/web/prototype/`. All three variants remain on that exploration branch as evidence; A is the selected reference. Preview: `http://127.0.0.1:4320/prototype/search-ui?variant=A`.

The prototype's plain JavaScript, synthetic data, simulated stock and UI-state toolbar are exploration tools. The production UI should be rewritten using React, TypeScript and RTK Query, following the agreed OpenAPI contracts and TDD/integration boundaries. The prototype toolbar and alternative layouts belong on the exploration branch.

This decision does not select a production data model, authorize live mutations, validate the backend or establish that A performs better. Review the implemented search UI against the selected hierarchy and the actual search requirements.

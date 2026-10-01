# Search UI Direction – B: Practical Shortlist

**Status:** selected by Csaba on 2026-10-01. This is a visual direction decision, not acceptance of a production implementation.

## Decision

Use prototype **B — Practical shortlist** as the design reference for the AEKI search page. User evidence: “A B variaciot valasztom” (“I choose variant B”). The user's reason was not stated; do not infer a usability result from the selection.

Preserve these defining characteristics:

- A compact list instead of an image-led product grid.
- Product image, name, description and article number grouped together.
- Price and local availability aligned for quick comparison.
- A separate sidebar for category, store and availability controls on desktop.
- Prominent search and sorting controls with a restrained dark header.
- Mobile stock labels and store controls remain accessible when the sidebar collapses.

## Reference and Implementation Boundary

The primary prototype is captured on `codex/prototype-search-ui`, initially in commit `41a3002`, under `apps/web/prototype/`. All three variants remain on that exploration branch as evidence; B is the selected reference.

The prototype's plain JavaScript, synthetic data, simulated stock and UI-state toolbar are exploration tools. The production UI should be rewritten using React, TypeScript and RTK Query, following the agreed OpenAPI contracts and TDD/integration boundaries. The prototype toolbar and alternative layouts belong on the exploration branch.

This decision does not select a production data model, authorize live mutations, validate the backend or establish that B performs better. Review the implemented search UI against the selected hierarchy and the actual search requirements.

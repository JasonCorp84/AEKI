# ADR-0003: Frontend Theme and Localization Boundaries

Date: 2026-10-01. Status: Proposed. Replaceable themes and interface language are user requirements; this implementation decision remains subject to review.

## Context

The production React app will use the selected B search layout. Its design must be reusable, support light/dark and alternative palettes, and allow interface-language changes. The current plain-JavaScript prototype is a visual reference and requires no changes for this decision.

## Proposed decision

Use semantic CSS custom properties with complete typed theme definitions. Keep mode and palette independent. Centralize settings and storage handling in a provider. Components depend on semantic roles rather than palette-specific values.

Use typed language resources with i18next/react-i18next, shared locale-aware formatting and stable backend error-code mapping. Start with Hungarian and English as a proposal. Localizing the interface does not imply translating catalog content or changing the price currency.

Keep preferences outside RTK Query server-data ownership. Presentational components receive narrow view models and callbacks. Validate HTTP, URL and persisted preference inputs at runtime. Settings must preserve the active search and require no refetch for interface-only changes.

## Alternatives

- Hardcoded feature-specific colors and strings: initially simple, but palette/language changes spread through product components.
- A custom translation engine: fewer dependencies, but pluralization, interpolation, fallback and typing become application maintenance.
- A standalone design-system package immediately: useful for multiple consumers, but unnecessary packaging before shared application demand exists.
- Persist preferences through backend accounts: useful later for cross-device settings; requires authentication and backend scope absent from the initial search journey.

## Consequences

Theme and language variation remain outside product-query logic. Feature UI is reusable and can be tested with real providers. Costs include translation completeness checks, palette readability review, storage fallback behavior and some provider setup. Avoid speculative interfaces and universal components; introduce shared primitives through concrete feature needs.

## Verification and review trigger

Prove theme replacement and language switching on the working search journey. Verify persisted/fallback settings, unchanged search criteria, no presentation-only refetch, keyboard focus and translated layouts. Repeat relevant checks as details are added. Review this decision if catalog localization, server rendering, account preferences or another application's design-system reuse becomes required.

See the [implementation plan](../../planning/react-ui-implementation-plan.md) for proposed slices and blockers. Acceptance of this ADR does not itself authorize ticket publication or implementation.

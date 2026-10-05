# ADR 0007: Reuse Google TypeScript Style

Status: Accepted — 2026-10-05, under Csaba's instruction to use existing Google or Airbnb rules rather than handwritten formatting rules.

## Decision

Use the Google Node.js team's [gts 7.0.0](https://github.com/google/gts) package. Import its shared ESLint configuration and reference its published Prettier preset directly. Local configuration supplies repository ignores, environment globals and the TypeScript project used for analysis; it defines no additional style rules.

`npm run format` runs ESLint's native automatic fixes followed by Prettier. The commit hook applies those tools to staged code and Prettier to other supported files. The existing whole-project push check and CI quality gate remain in place. Generated contracts are regenerated using the same shared Prettier configuration.

## Rationale and consequences

Google's package provides TypeScript-oriented linting and automatic fixes together with Prettier. The [official Airbnb package](https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb/package.json) declares ESLint 7/8 peers, whereas this repository uses ESLint 10. The Google configuration was exercised using the repository's installed tooling rather than assuming compatibility.

The shared style changes formatting across the repository, including an 80-column default, compact object/import braces and arrow-parameter parentheses. Existing handwritten application formatting was changed through the installed tools, not a custom formatter. No promise is made that the preset inserts the same blank lines as a manually organized example: [Prettier preserves existing blank lines](https://prettier.io/docs/rationale#empty-lines).

The gts dependency tree initially introduced vulnerable temporary-file tooling. A package override selects the patched `tmp` 0.2.7 release; installation then reported zero audit vulnerabilities. This dependency compatibility constraint does not alter style rules.

Review this decision when upgrading ESLint, TypeScript, Prettier or gts. The complete test, contract and coverage gates must remain successful; the 100% coverage requirement is unchanged. This updates ADR-0006's commit formatter choice without changing its coverage or branch-protection policy.

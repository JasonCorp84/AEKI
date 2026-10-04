# ADR 0006: CI, Formatting and Complete Coverage

Status: Accepted — 2026-10-04.

## Context

AEKI needs reproducible quality checks before changes enter `main`. Csaba approved commit-time formatting, push-time formatting validation, GitHub Actions CI without AWS deployment, and file-level 100% coverage for handwritten application code and executable project tooling.

## Decision

- Husky runs lint-staged and the installed Prettier formatter before commits. lint-staged preserves partially staged changes. Pre-push runs `npm run format:check` over every supported, non-ignored project file without changing the commit.
- GitHub Actions runs `npm run check` on pushes, pull requests and merge-queue events. This includes formatting, engineering measurement validation, OpenAPI/generated contract consistency, lint, strict type checking, tests with an isolated PostgreSQL instance, complete coverage and production builds.
- `main` requires a pull request and the successful `Quality gate` check against an up-to-date branch. Protection applies to administrators. No additional reviewer is required for this solo project.
- All four coverage metrics — lines, statements, functions and branches — must be 100% for each executable source file. The gate compares covered counts to total counts rather than rounded percentages and independently inventories source files, so an absent file or report fails.
- Scope includes React and Nest entrypoints, contract validation and every handwritten root tooling script. Exclusions are tests/fixtures, generated code, dependencies/build output, configuration-only files and the archived `apps/web/prototype` exploration. Type-only declarations have no runtime instructions and are identified through TypeScript emission. SQL migrations are verified through real apply/rollback/reapply tests rather than JavaScript percentages. The prototype remains in formatting scope.
- Vitest measures the three TypeScript workspaces, with Nest compiled JavaScript remapped to original TypeScript. Native c8 collects tooling and subprocess execution. Database tooling tests execute through Node's test runner while the isolated database is available; keeping these outside Vitest avoids resetting native V8 counters and interpreting transformed tooling as original source. The gate merges the four reports and checks the independent inventory.
- Mock only external SDK/process boundaries for deterministic failure cases. Keep actual HTTP, Redux/RTK Query and PostgreSQL integration tests alongside them.

## Consequences

Local hooks give fast feedback but can be bypassed. GitHub protection supplies the authoritative merge gate. A coverage or database failure blocks the pipeline; there is no fallback to a reduced suite or lowered threshold.

100% execution coverage does not prove correctness or TDD. Tests must assert observable behavior, and new behavior still follows the agreed RED/GREEN workflow. No coverage-ignore pragmas were added to reach the target.

CI produces coverage artifacts with a 14-day retention period. Official actions are pinned to verified commit SHAs. AWS deployment is outside this decision.

References: [Vitest coverage](https://main.vitest.dev/config/coverage), [c8](https://github.com/bcoe/c8), [Husky](https://typicode.github.io/husky/get-started.html), [lint-staged](https://github.com/lint-staged/lint-staged), [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

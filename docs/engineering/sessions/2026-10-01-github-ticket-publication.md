# GitHub Ticket Publication Evidence — 2026-10-01

Sequence: S36. Turn: `01a0f7f9-3ce9-7d72-a993-9ef5c83ae3ed`.

## Request and authorization

Csaba explicitly invoked to-tickets and requested publication to GitHub for React and the project foundation. This establishes the tracker destination for this AEKI delivery and authorizes publication of the previously presented UI breakdown, supplemented by concrete foundation journeys. Cross-project priorities and engineering-methodology ownership remain in Linear. No implementation, assignment or active-priority change was requested.

## Technique and skills

Skill applied: `to-tickets`, freshly reloaded. Used the existing React plan and architecture context, created demoable foundation slices, avoided duplicate issues, published blockers before their dependants, and verified native relationships. The explicit publication instruction superseded the earlier pending approval/destination question. No other skill was applied in this task.

English descriptions include Why now, observable outcome, acceptance criteria / Definition of Done, blockers, review trigger, engineering policy and source references. Strict TypeScript/runtime validation, SOLID, spec-first OpenAPI and meaningful integration/E2E tests are specified. These are future requirements, not completed engineering evidence. ADR-0003 remains proposed.

## Timing and reconciliation

- Start: `2026-10-01T14:58:21.624Z`, task-start event.
- Delivery-preparation checkpoint: `2026-10-01T15:06:39Z`, clock observation; **497.376 seconds** elapsed.
- Final completion time: unknown until a task-complete event can be read next turn.
- Human active time: not measured.
- S35 completed at `2026-10-01T14:40:27.546Z`, **112.247 seconds**. Commit `6a6a69c` and push to codex/prototype-search-ui succeeded; local and remote SHA matched. One push retry followed a restricted-network connection failure.

## Outcome and validation

Published [ten issues](../../planning/github-implementation-issues.md): three foundation journeys and seven React/product journeys. Created ready-for-agent, foundation and react-ui labels. Read each issue back to verify open state, labels and acceptance criteria. Read native dependencies back and verified all eleven edges against the intended graph. Initial repository query found no issues, so no existing parent was modified or closed.

GitHub REST publication used the existing configured Git credential helper with credentials kept in process memory and omitted from outputs. Official [GitHub dependency API documentation](https://docs.github.com/en/rest/issues/issue-dependencies) established the native endpoint and blocking issue-ID payload. No production code or prototype changes were made.

## Recoveries and evidence boundaries

- Capability discovery: three gh invocations failed because the CLI was unavailable. They were not re-executed; publication switched to the GitHub REST API using existing repository authentication. Count as a method fallback, not three UI-quality corrections.
- One verification retry: the first checker miscounted an empty PowerShell REST array for issue #1. Diagnostic readback confirmed the correct empty dependency list. The corrected checker explicitly extracted dependency numbers and successfully verified all ten issues. No duplicate issue publication occurred.
- User quality corrections and artifact self-revisions: none observed at the checkpoint. The verification-script repair above is a technical recovery.

The local plan, publication index and this raw evidence were updated after verification. No commit or push was requested for these subsequent documentation updates. Issue status is canonical in GitHub for this delivery; measurement interpretation remains in the Linear AI-Assisted Engineering Practice project.

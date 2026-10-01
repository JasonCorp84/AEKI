# Published AEKI Implementation Issues

Published: 2026-10-01, following Csaba's explicit request for GitHub tickets covering React and the project foundation. GitHub is the execution tracker for this delivery; Linear retains cross-project priority and methodology ownership. This index is a publication snapshot, not a second backlog. Consult the linked issues for current status.

| Issue | Deliverable | Blocked by |
| --- | --- | --- |
| [#1](https://github.com/JasonCorp84/AEKI/issues/1) | Fresh-checkout React–NestJS health journey, typed contracts and runnable workspace | None |
| [#2](https://github.com/JasonCorp84/AEKI/issues/2) | PostgreSQL readiness shown through the running application | #1 |
| [#3](https://github.com/JasonCorp84/AEKI/issues/3) | GitHub Actions verifies the actual application/database journey | #1, #2 |
| [#4](https://github.com/JasonCorp84/AEKI/issues/4) | A search layout through RTK Query and contracted HTTP fixtures | #1 |
| [#5](https://github.com/JasonCorp84/AEKI/issues/5) | Light/dark and palette switching while preserving search | #4 |
| [#6](https://github.com/JasonCorp84/AEKI/issues/6) | Hungarian/English interface switching while preserving search | #4 |
| [#7](https://github.com/JasonCorp84/AEKI/issues/7) | Actual product search through React, NestJS and PostgreSQL | #4, #2 |
| [#8](https://github.com/JasonCorp84/AEKI/issues/8) | Actual filtering and URL criteria restoration | #7 |
| [#9](https://github.com/JasonCorp84/AEKI/issues/9) | Stable sorting and pagination of filtered results | #8 |
| [#10](https://github.com/JasonCorp84/AEKI/issues/10) | Product details and return to preserved search | #7 |

All ten issues were read back and verified as open, with acceptance criteria and the ready-for-agent triage label. Eleven native GitHub blocking edges match the table. The label means the specification is prepared; an issue may start only when its blockers are complete. No issue was assigned, closed or moved to an active priority by publication.

Start with #1. After it completes, #2 and #4 are independent. Theme, language and actual product integration can proceed after their respective blockers. CI is a release requirement rather than an artificial prerequisite to writing every feature. ADR-0003 remains proposed; record the tooling decision before implementing it.

See the [React design and implementation plan](react-ui-implementation-plan.md) for rationale. The original publication referenced B; Csaba subsequently selected A on 2026-10-01 and the existing tickets were updated in place. Dependencies and feature scope remain unchanged. The throwaway prototype implementations were left unchanged. No production implementation was performed by ticket publication or the direction change.

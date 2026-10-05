# AI-Assisted Engineering Measurement Log

## Purpose and Ownership

Measure how Csaba uses the assistant: the order of tasks, techniques and skills applied, elapsed time, retries, feedback, validation and the resulting artifact. Use the evidence to improve the engineering workflow.

The **AI-Assisted Engineering Practice project in Linear is canonical for methodology, metric definitions, experiments, reviews and commitments**. This repository contains the AEKI evidence and a readable protocol snapshot. Recording this session does not change project priority, status or Definition of Done.

Started on 2026-10-01 at the user's request. Historical entries are retrospective; future entries should be recorded during the work.

## Measurement Rules

| Field                    | Definition                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task ID and order        | Stable ID plus chronological position; link an AI turn to its parent engineering task                                                                                                          |
| Intended outcome         | User-visible result and validation expected before work begins                                                                                                                                 |
| Technique                | What was done: contract-first design, reference-image guidance, TDD, rendered visual inspection, etc. Multiple techniques can be recorded                                                      |
| Skills applied           | Exact skill names, purpose, fresh load versus reused guidance, and evidence of application. Use `None` for confirmed absence and `None observed` for retrospective audit limits                |
| Skill loaded only        | A skill read without observed application; do not count it as an applied technique                                                                                                             |
| Assistant-turn wall time | Assistant task-start timestamp to task-complete timestamp. Includes tool execution, waiting, recovery and context compaction inside the turn; excludes time between turns                      |
| Task lead time           | First task start to accepted completion; includes human review and idle gaps. Unknown if acceptance is not timestamped                                                                         |
| Human active time        | User's actual reading, prompting, coding and reviewing time; manually measured, never inferred from gaps between messages                                                                      |
| Technical retry          | Re-execution to recover from a failed operation. Initial execution is attempt 1; retries = subsequent executions. Failed commands, render retries and network recovery are separate categories |
| Output revision          | A new artifact version following review or self-check. It can occur without a failed tool call                                                                                                 |
| Scope refinement         | A changed or clarified target; keep separate from corrections to an unchanged requirement                                                                                                      |
| Validation evidence      | Rendered inspection, contract check, test run or verified remote state. A delivered artifact is not automatically accepted or validated                                                        |
| Outcome                  | In progress, delivered awaiting review, accepted, rejected, superseded or blocked; record acceptance evidence separately                                                                       |

**Do not collapse revisions, scope refinements and tool retries into one retry number.** A diagnostic read is not a retry; a second render after changing the diagram is a validation pass, unless it is recovering from the same rendering failure. `Unknown` and `not audited` do not mean zero.

Readability improvements count as self-revisions when found during validation, and user-requested corrections when found by the user. A skill name appearing in a document, a tools-search result or an audit command is not evidence that the skill was applied. Reusing previously loaded skill guidance counts as application when the task behavior follows it; it does not count as another skill-file load.

Store timestamps in UTC using ISO 8601. Display local time as Europe/Budapest when useful. Round durations only for presentation. Do not use Git commit times as task starts or calculate human work from assistant latency.

## Recording Procedure

Automated enforcement and lifecycle limits are documented in [measurement validation](measurement-validation.md). `npm run measurements:check` runs as part of the root check; `npm run test:measurements` separately tests the measurement behavior. At the start of the next turn, reconcile the preceding completion from the actual Codex event log before adding a new active row. S48 onward requires audited numeric retry counts; the fixed legacy exemptions remain explicit warnings.

1. At task start, record the request, outcome, technique, planned validation and UTC start time.
2. During execution, record skill application, meaningful strategy changes, failed attempts and recoveries. Record the reason, not only a count.
3. Before reporting delivery, record a UTC checkpoint, elapsed time, validation and result. Mark the checkpoint as such; do not label it the exact task-complete timestamp.
4. When the task-complete timestamp becomes available, reconcile the previous entry with the event log. Record user acceptance or further correction on the next turn.
5. After a meaningful task or a group of comparable tasks, review the evidence in Linear. Keep raw AEKI observations here and link the relevant commit or artifact.

## Task Entry Template

```text
Task ID / session / sequence:
Parent task and source turn IDs:
Request and intended outcome:
Initial scope and subsequent scope refinements:
Technique(s) / hypothesis:
Skills applied: name, purpose, fresh load or reuse, observed effect
Skills loaded only:
Started at UTC:
Delivery checkpoint UTC:
Completed at UTC / source:
Assistant-turn wall seconds:
Human active seconds / measurement source:
Accepted at UTC / acceptance evidence:
Technical attempts and retries: category, reason, recovery, count
Self-revisions:
User-requested corrections:
Scope refinements:
Validation and quality outcome:
Artifact / commit:
Environment or other confounders:
What to try next:
Unknown or unaudited fields:
```

## Baseline Session

- [2026-10-01 session review](sessions/2026-10-01-aeki.md)
- [Ordered assistant-turn timings and skill audit](sessions/2026-10-01-aeki-turn-timings.csv)
- [UI prototype session evidence](sessions/2026-10-01-ui-prototype.md) — three design alternatives; see the capture branch in the session record.

The timing CSV is a snapshot extracted from the local Codex event log. It stores task labels and metadata, not raw prompts, screenshots, credentials or full tool output. Rows without a matching completion event retain an unknown duration.

## Comparing Techniques

Latest UI exploration: S62 — engineering dashboard prototype, with three read-only variants, five proposed task histories, actual browser interaction checks and explicitly provisional cause interpretations. See the [prototype instructions](../../apps/web/prototype/engineering-dashboard.README.md). Csaba accepted B; detailed current-conversation notes are retained locally under Git-ignored `.conversations/`.

Dashboard discovery: S61 — first decision frontier, using `grill-with-docs`, `grilling` and `domain-modeling`. Existing timing evidence is separated from proposed quality constructs. Detailed current-conversation records are local and Git-ignored. The deferred cross-project design task is [Linear BAL-16](https://linear.app/balogh-csaba/issue/BAL-16/design-c4-context-and-cross-project-ai-workflow-benchmarking), Backlog; current dashboard data remains CSV-based.

Latest readiness review: [S60 — complete issue #2 review](sessions/2026-10-05-issue-2-review.md). Independent Standards and Spec reviews found no actionable defects in the confirmed diff; fresh contract, frontend, Nest and isolated PostgreSQL checks passed. Browser evidence was inspected rather than rerun. Issue status is unchanged.

Latest quality-gate work: [S54 — CI, Git hooks and complete coverage](sessions/2026-10-04-ci-quality-gates.md), including approved coverage scope, actual Git-hook behavior, PostgreSQL verification and per-file coverage enforcement.

Latest coverage correction: [S55 — reject empty instrumentation](sessions/2026-10-04-empty-coverage-instrumentation.md), with a real CLI RED/GREEN regression and compatibility verification for files without functions or branches.

S56 established a local NestJS teaching workspace after Csaba confirmed the goal of independently understanding and extending AEKI. The `teach` skill grounded the first routing lesson in the actual controller and official documentation. All teaching content and local session evidence live under Git-ignored `.teaching/nestjs/`; no learner mastery is claimed before a demonstrated answer. Native formatting and ignore checks passed; technical retries: 0. Turn timing is recorded in the measurement CSV and completion is reconciled on a later turn.

S57 continued after Csaba reported the first lesson complete. The reused `teach` workflow produced a local controller-registration lesson grounded in AppModule and official NestJS module documentation, using the existing shared stylesheet. Lesson files remain Git-ignored. Reported completion is distinguished from demonstrated mastery; the learner's prediction is pending. Technical retries: 0. S56 timing was reconciled to 281.720 seconds; S57 completion awaits its actual event.

S58 prepared the next local lesson on constructor injection using AEKI's existing token and factory provider. The `teach` workflow and shared assets were reused; source code and official custom-provider documentation were checked. The learner demonstrated the previous import/registration distinction; injection understanding remains unassessed. Teaching content and detailed evidence stay Git-ignored. Technical retries: 0. S57 timing reconciled to 157.047 seconds; S58 completion awaits its actual event.

Latest formatting work: [S59 — existing Google TypeScript Style](sessions/2026-10-05-google-typescript-style.md). The published gts ESLint and Prettier presets replace local style rules; native automatic fixes, staged-content preservation and full verification are recorded in the session evidence. Teaching materials remain ignored, and their completed-turn timing was reconciled independently.

Latest tooling setup: [S53 — project-wide Prettier](sessions/2026-10-04-prettier-setup.md), including native formatting, reproducible contract generation, formatter/check integration and verified regression checks.

Latest review fixes: [S52 — measurement validation and C4](sessions/2026-10-04-code-review-fixes.md), including two RED/GREEN regressions, frozen historical identities, strict calendar validation and the Docker interruption that prevented a fresh database test run.

Latest measurement improvement: [S50 — automated validation](sessions/2026-10-03-measurement-validation.md), including approved seams, eight tests and recovery of S43–S47 timing from actual events.

Publication checkpoint: [S47 — issue #2 commit and push](sessions/2026-10-03-issue-2-publication.md), authorized by Csaba after implementation delivery; remote verification is reported at delivery.

Latest database implementation evidence: [S45–S46 — PostgreSQL readiness](sessions/2026-10-03-postgresql-readiness-implementation.md), including approved seams, observed RED/GREEN, Docker/approval interruption, prerequisite discoveries, 40 passing tests and actual browser outage/recovery. Reconciled assistant-turn durations are 989.148 and 1489.125 seconds; the overnight gap is excluded and original checkpoints are preserved.

Latest clarity evidence: [S42 — Clean Code refactoring](sessions/2026-10-02-clean-code-refactoring.md), including self-explanatory naming, regression checks, skills, observed retries and scope limits.

Latest implementation evidence: [S41 — foundation health journey](sessions/2026-10-01-foundation-health-implementation.md), including four approved test boundaries, observed TDD failures, clean candidate verification, skills and separate retry categories.

Start with comparable tasks of similar scope and difficulty. Record the acceptance criterion before choosing a technique. Compare time **and** quality, user effort and correction count. Skill presence alone does not establish effectiveness.

Useful initial measurements:

- Assistant-turn wall time per task; also task lead time where acceptance is recorded.
- First-delivery acceptance: accepted without user-requested correction, under the same scope.
- User-requested correction count, self-revisions, scope refinements and technical retries, reported separately.
- Human active time and validation outcome.
- Techniques and skills associated with accepted results; explain environment and scope differences.

The existing Linear project also tracks token/active engineering hour, validated ECU/hour, token/validated ECU, rework ratio and exploration-to-convergence ratio. This baseline does **not** calculate them: tokens, active engineering time, validated ECU and activity classification are not yet sufficiently instrumented. Do not substitute assistant wall time for active engineering time or invent token costs.

An initial hypothesis is that providing a concrete visual reference before diagram generation reduces user-requested revisions. The current session provides one observation, not a controlled comparison or proof. A future experiment needs comparable tasks, stable acceptance criteria and several observations.

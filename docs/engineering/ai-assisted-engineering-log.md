# AI-Assisted Engineering Measurement Log

## Purpose and Ownership

Measure how Csaba uses the assistant: the order of tasks, techniques and skills applied, elapsed time, retries, feedback, validation and the resulting artifact. Use the evidence to improve the engineering workflow.

The **AI-Assisted Engineering Practice project in Linear is canonical for methodology, metric definitions, experiments, reviews and commitments**. This repository contains the AEKI evidence and a readable protocol snapshot. Recording this session does not change project priority, status or Definition of Done.

Started on 2026-10-01 at the user's request. Historical entries are retrospective; future entries should be recorded during the work.

## Measurement Rules

| Field | Definition |
| --- | --- |
| Task ID and order | Stable ID plus chronological position; link an AI turn to its parent engineering task |
| Intended outcome | User-visible result and validation expected before work begins |
| Technique | What was done: contract-first design, reference-image guidance, TDD, rendered visual inspection, etc. Multiple techniques can be recorded |
| Skills applied | Exact skill names, purpose, fresh load versus reused guidance, and evidence of application. Use `None` for confirmed absence and `None observed` for retrospective audit limits |
| Skill loaded only | A skill read without observed application; do not count it as an applied technique |
| Assistant-turn wall time | Assistant task-start timestamp to task-complete timestamp. Includes tool execution, waiting, recovery and context compaction inside the turn; excludes time between turns |
| Task lead time | First task start to accepted completion; includes human review and idle gaps. Unknown if acceptance is not timestamped |
| Human active time | User's actual reading, prompting, coding and reviewing time; manually measured, never inferred from gaps between messages |
| Technical retry | Re-execution to recover from a failed operation. Initial execution is attempt 1; retries = subsequent executions. Failed commands, render retries and network recovery are separate categories |
| Output revision | A new artifact version following review or self-check. It can occur without a failed tool call |
| Scope refinement | A changed or clarified target; keep separate from corrections to an unchanged requirement |
| Validation evidence | Rendered inspection, contract check, test run or verified remote state. A delivered artifact is not automatically accepted or validated |
| Outcome | In progress, delivered awaiting review, accepted, rejected, superseded or blocked; record acceptance evidence separately |

**Do not collapse revisions, scope refinements and tool retries into one retry number.** A diagnostic read is not a retry; a second render after changing the diagram is a validation pass, unless it is recovering from the same rendering failure. `Unknown` and `not audited` do not mean zero.

Readability improvements count as self-revisions when found during validation, and user-requested corrections when found by the user. A skill name appearing in a document, a tools-search result or an audit command is not evidence that the skill was applied. Reusing previously loaded skill guidance counts as application when the task behavior follows it; it does not count as another skill-file load.

Store timestamps in UTC using ISO 8601. Display local time as Europe/Budapest when useful. Round durations only for presentation. Do not use Git commit times as task starts or calculate human work from assistant latency.

## Recording Procedure

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

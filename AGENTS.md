# Documentation language

Write all new or updated project documentation in English, including README content, architecture explanations, ADRs, Mermaid labels, relationship descriptions, and documentation filenames. Preserve technical meaning and source attribution when translating existing documents.

Conversation with the user may remain in Hungarian.

# Code clarity

Apply Clean Code throughout handwritten application code, tests, tooling and prototypes. Choose names that explain the domain role, result and intent; use verb phrases for actions and `is`/`has`/`can` for booleans. Keep each function focused on one responsibility, make branching explicit, and keep abstraction levels consistent. Explain a function's inputs, outcome and failure behavior in plain language (the Feynman check); revise unclear names or structure before delivery. Comments explain reasons and constraints; code explains actions. Preserve external contracts and observable behavior during refactoring, and verify through the existing public test seams. Regenerate generated code from its source rather than editing its output.

# Engineering measurement

For substantive AEKI tasks, record task order, start/delivery timestamps, applied techniques and skills (including reuse or None), validation, revisions and technical retries in the [engineering log](docs/engineering/ai-assisted-engineering-log.md) and its session evidence. Follow its definitions; reconcile completed-turn timing and user feedback when available. Never invent missing durations or treat unaudited retries as zero.

Linear remains canonical for methodology, experiments and project commitments. Repository logs hold AEKI evidence; recording a task does not authorize a project status or priority change.

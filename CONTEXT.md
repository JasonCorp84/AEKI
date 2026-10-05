# AEKI Engineering Measurement Language

Terms agreed for understanding the quality of Csaba's collaboration with the assistant.

## Language

**Engineering task**:
A unit of work pursuing one agreed outcome, potentially spanning several assistant turns, corrections and verification events. It is the primary unit of dashboard analysis.
_Avoid_: Treating every assistant turn as a separate completed task.

**Avoidable rework**:
Correction needed to satisfy an already accepted requirement because the previous result was incorrect, incomplete or based on a misunderstanding. New requirements, deliberate experiments and planned TDD RED steps are separate categories.
_Avoid_: Counting all repeated work as rework.

**AI slop**:
Unnecessary, incorrect or unverified AI output relative to agreed requirements that requires correction or rejection. A correction alone does not establish AI slop.
_Avoid_: Treating length, generated code volume or every correction as proof of slop.

**Cause investigation**:
Evidence-linked investigation connecting an observed problem and its impact to events, triggers, contributing conditions and missed detection opportunities. It leads to a preventive change and an outcome check, while preserving multiple possible causes and unresolved hypotheses.
_Avoid_: Treating a responsibility label or an unsupported explanation as a verified root cause.

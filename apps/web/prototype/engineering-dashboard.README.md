# Engineering Dashboard — Throwaway Prototype

Question: can a user connect applied skills and prompt context to observed outcomes, then trace a problem through evidence to possible contributing causes?

Run from the repository root:

```sh
npm run prototype:dashboard
```

Open <http://127.0.0.1:4321/prototype/engineering-dashboard?variant=B>. Csaba explicitly accepted B; it is the default view, with the prompt first and its related colored context below.

- A: overview with duration bars and task drill-down.
- B: skill/prompt evidence matrix with selectable task detail.
- C: investigation workspace with a case list and the agreed six-step chain.

The floating arrows and keyboard left/right arrows cycle variants; text fields retain their normal keyboard behavior. Skill, outcome and text filters apply to five proposed task reconstructions. Filters and selection are in memory; the variant is encoded in the URL. No production route, database, telemetry or persistence is added. The server refuses production mode.

## Evidence and interpretation

The JSON snapshot was exported with PowerShell's native `Import-Csv` and `ConvertTo-Json` from the timing CSV after S61 completion was reconciled. It contains 61 rows, 57 measured durations and 15 numeric retry records. These totals describe the snapshot, not the five task sample or a success rate. There is no automatic refresh; later CSV changes require a new export.

Task definitions use selected turns and English summaries of inspected session evidence, plus explicitly labelled Hungarian user prompt excerpts from the conversation. These excerpts are not complete prompt captures, hashes or prompt versions. Preceding plans, approvals, image attachments and omitted turns can affect outcomes. Task grouping is a reconstruction awaiting Csaba's review; a task's measured total sums only its selected turns and excludes gaps. The source timeline retains original skill evidence and retry labels.

No skill is assigned causal credit. There are no controlled comparisons or comparable task cohorts; several skills may share one outcome. `None observed` is not evidence of confirmed skill absence. Unknown retry totals remain unknown; partial numeric totals are labelled with their audited denominator. Verification passing does not establish user acceptance, absence of slop or long-term software health.

Cause explanations are provisional, with evidence, triggers, possible contributing conditions, missed detection, changes and follow-up shown separately. A design-direction change and expected TDD RED are distinct from quality correction. Planning/AI responsibility has not been automatically assigned. No cause hypothesis or UI alternative is accepted by elapsed time or silence.

Native Prettier formats these files. Browser checks verify variant switching, skill filtering, text search, task drill-down and reset; no production tests or coverage are added for this throwaway UI. Promotion requires a separate production implementation and accepted testing boundaries. Layout B is accepted; task grouping and cause interpretations remain provisional. The prototype is captured on the `codex/engineering-dashboard-prototype` branch, following the prototype skill. Detailed current-conversation notes remain local under Git-ignored `.conversations/`. The larger cross-project system is deferred to Linear BAL-16; CSV remains sufficient for this dashboard.

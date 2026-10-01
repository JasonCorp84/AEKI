# Issue #1 — Provisional Mikado Graph

Arrows mean **requires**. Goal at the bottom; prerequisites above it. Implement from the upper leaves toward the goal. All implementation nodes are planned, not experimentally completed. See the [plan](../issue-1-mikado-plan.md) for probes, acceptance evidence and undo policy.

```mermaid
%%{init: {"theme":"base","themeVariables":{"background":"#ffffff","primaryColor":"#eff6ff","primaryTextColor":"#111827","primaryBorderColor":"#2563eb","lineColor":"#1f2937","fontFamily":"Arial","fontSize":"16px"},"flowchart":{"curve":"linear","nodeSpacing":55,"rankSpacing":55}}}%%
flowchart BT
    G["G · Ticket #1 complete<br/>Fresh-checkout health journey"]
    M6["M6 · Fresh-checkout verification"]
    M5["M5 · Actual browser → Nest journey"]
    M3["M3 · Nest HTTP behavior<br/>RED → GREEN → refactor"]
    M4["M4 · React + RTK Query behavior<br/>RED → GREEN → refactor"]
    M2["M2 · OpenAPI health contract<br/>Generated types + runtime validation"]
    M1["M1 · Runnable npm workspace<br/>React + Nest + test tooling"]
    M0["M0 · Protected baseline<br/>Agreed public test boundaries"]
    G --> M6
    M6 --> M5
    M5 --> M3
    M5 --> M4
    M3 --> M2
    M4 --> M2
    M2 --> M1
    M1 --> M0
    classDef goal fill:#dcfce7,stroke:#166534,color:#111827,stroke-width:3px;
    class G goal;
    linkStyle default stroke:#1f2937,stroke-width:2px;
```

Suggested working order: M0 → M1 → M2 → M3 → M4 → M5 → M6 → G. M3/M4 have no dependency on each other; the sequence is a preference, not another blocking edge.

# Issue #2 — Verified Mikado Graph

Arrows mean **requires**. Goal at the bottom. Green prerequisite nodes have local verification evidence; the goal awaits user review. See the [plan](../issue-2-mikado-plan.md) for experiments and acceptance evidence.

```mermaid
%%{init: {"theme":"base","themeVariables":{"background":"#ffffff","primaryColor":"#eff6ff","primaryTextColor":"#111827","primaryBorderColor":"#2563eb","lineColor":"#1f2937","fontFamily":"Arial","fontSize":"16px"},"flowchart":{"curve":"linear","nodeSpacing":55,"rankSpacing":55}}}%%
flowchart BT
    G["G · Truthful database readiness<br/>Verified locally · awaiting review"]
    M7["M7 · Fresh setup and safe teardown"]
    M6["M6 · Browser → Nest → PostgreSQL<br/>Outage and recovery"]
    M5["M5 · React + RTK Query<br/>Typed readiness feedback"]
    M4["M4 · Nest HTTP<br/>200 / 503; independent liveness"]
    C["C · OpenAPI readiness contract<br/>Generated types + runtime validation"]
    M3["M3 · Real database probe<br/>Bounded timeout + cleanup"]
    M2["M2 · Isolated migration smoke"]
    M1["M1 · PostgreSQL + test isolation<br/>Pinned tooling and ADR"]
    M0["M0 · Protected baseline<br/>Agreed test seams"]
    G --> M7
    M7 --> M6
    M7 --> M2
    M6 --> M4
    M6 --> M5
    M4 --> M3
    M5 --> C
    M4 --> C
    C --> M1
    M3 --> M1
    M2 --> M1
    M1 --> M0
    classDef goal fill:#fef3c7,stroke:#92400e,color:#111827,stroke-width:3px;
    class G goal;
    classDef verified fill:#dcfce7,stroke:#166534,color:#111827,stroke-width:2px;
    class M0,M1,M2,M3,M4,M5,M6,M7,C verified;
    linkStyle default stroke:#1f2937,stroke-width:2px;
```

M5 requires C, not the completed backend implementation. Migration smoke is a separate delivery prerequisite; it is not falsely made a dependency of a connectivity-only query.

# Issue #4 — Mikado Dependency Graph

Arrows mean **requires**. The goal is at the bottom. These approved nodes are implemented locally; [verification evidence](../../engineering/sessions/2026-10-05-issue-4-implementation.md) records actual checks. Delivery acceptance remains pending.

```mermaid
flowchart BT
    M0["M0 · Baseline and approved test seams"]
    M1["M1 · OpenAPI and runtime contract"]
    M2["M2 · Explicit development HTTP fixtures"]
    M3["M3 · First working name/article search"]
    M4["M4 · Debounce, clearing and current-query ownership"]
    M5["M5 · States and retry"]
    M6["M6 · Accessible A layout and reusable boundaries"]
    M7["M7 · Full gates and browser evidence"]
    G["G · Accepted issue #4 delivery"]
    M1 --> M0
    M2 --> M1
    M3 --> M2
    M4 --> M3
    M5 --> M4
    M6 --> M5
    M7 --> M6
    G --> M7
    classDef task fill:#eef2ff,stroke:#334155,color:#0f172a;
    classDef goal fill:#dcfce7,stroke:#166534,color:#14532d;
    class M0,M1,M2,M3,M4,M5,M6,M7 task;
    class G goal;
    linkStyle default stroke:#334155,stroke-width:2px;
```

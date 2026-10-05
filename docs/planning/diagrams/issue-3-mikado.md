# Issue #3 — Proposed Mikado Graph

Status: implementation verified; delivery acceptance pending. Arrows mean **requires**; the goal is at the bottom. The graph records the accepted dependency plan; observed experiments are tracked in the [implementation session](../../engineering/sessions/2026-10-05-issue-3-browser-ci.md). See the [plan](../issue-3-mikado-plan.md).

```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#eff6ff","primaryTextColor":"#111827","primaryBorderColor":"#2563eb","lineColor":"#1f2937","fontFamily":"Arial","fontSize":"16px"},"flowchart":{"curve":"linear","nodeSpacing":45,"rankSpacing":50}}}%%
flowchart BT
    G["G · Real application journey verified in CI<br/>User acceptance required"]
    M7["M7 · Clean reproduction and final green run"]
    M6["M6 · Remote contract and browser failure proof"]
    M5["M5 · Add smoke to existing Quality gate"]
    M4["M4 · Safe artifacts and owned teardown"]
    M3["M3 · Browser health, DB outage and recovery"]
    M2["M2 · Isolated PG + built API + built web"]
    M1["M1 · Pinned Playwright + Chromium"]
    M0["M0 · Protected baseline and approved boundaries"]
    G --> M7
    M7 --> M6
    M6 --> M5
    M5 --> M4
    M4 --> M3
    M3 --> M2
    M2 --> M1
    M1 --> M0
    classDef goal fill:#fef3c7,stroke:#92400e,color:#111827,stroke-width:3px;
    class G goal;
    linkStyle default stroke:#1f2937,stroke-width:2px;
```

Existing format, contract, type, build, PostgreSQL integration and coverage gates remain delivery prerequisites. The linear shape communicates the proposed first execution order; new prerequisite branches are added only when actual experiments uncover them.

# Mikado Plan — Issue #1: Runnable React–NestJS Health Journey

Date: 2026-10-01. Status: M0–M6 implemented and verified locally; G awaits review and publication. Parent: [GitHub issue #1](https://github.com/JasonCorp84/AEKI/issues/1), read with its comments during planning. The issue remains the delivery/status source of truth. This plan introduces no additional tickets or active priorities. The initial hypotheses below are retained as planning history; current evidence is recorded in the implementation section.

## Goal and boundary

**G:** From a fresh checkout, install the project, start React and NestJS, and observe the actual API's health in the browser through a validated OpenAPI contract. Loading, reachable and unreachable states are demonstrable. Both apps build, relevant checks pass, and behavior-first RED → GREEN → refactor evidence exists.

Use the selected A visual direction only for a small, readable status screen and reusable styling/text seams. The complete catalog, product search, theme selector and language selector belong to later issues. PostgreSQL readiness belongs to #2; GitHub Actions belongs to #3. Health means API liveness here, not database readiness.

Keep all existing prototypes as exploration evidence. The live issue retains an older acceptance line about preserving B; its explicit current-A section supersedes the old direction. Preserving B as an alternative does not make B the production reference.

## Why this is a provisional Mikado graph

Mikado discovers prerequisites through small attempts: attempt the goal, record what blocks it, undo the unsuccessful attempt, then solve a prerequisite that has no remaining blockers. Work back toward the goal through verified steps. Here we are adapting that approach to an unimplemented application foundation rather than refactoring an existing production system.

Repository evidence: only the throwaway web prototype exists; production workspace manifests, API, contract package and CI are absent. The working tree was clean at planning intake. Local tools reported Node v24.18.1 and npm 11.16.0; this observation does not select a supported project runtime. Validate and pin compatible versions during M1.

The graph below is a hypothesis informed by that evidence. No compiler/test failure is invented, and no planned prerequisite is called experimentally confirmed. Split, remove or add edges when an actual probe warrants it. Do not build infrastructure merely because it appears in the initial drawing.

## Graph

See the [separate Mermaid graph](diagrams/issue-1-mikado.md). Its arrows mean **this node requires the node it points to**. The goal is at the bottom. Implement prerequisites first, in the opposite direction of the arrows.

Proposed order: **M0 → M1 → M2 → M3 / M4 → M5 → M6 → G**. M3 and M4 are independent after M2; backend-first is a suggested working order, not a blocking edge. Only one implementation experiment needs to be active at a time.

## Initial goal probe — E0

Try the smallest actual journey: start the web/API applications and request the agreed health operation through the browser. In the current repository, inspect whether the necessary commands and manifests exist before running anything. Their absence is a setup blocker, not an observed failing behavioral test.

Record exact evidence and the smallest prerequisite. If a throwaway experiment adds incomplete code, undo only that experiment's changes and preserve its findings in this plan. Return to the last verified state before addressing the prerequisite. Do not leave a broken partially wired app while adding unrelated tooling.

## Nodes and completion evidence

| Node                                 | Attempt / minimal change                                                                                                                                                                | What could block it (hypothesis)                                                                         | Evidence required to keep the change                                                                                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M0 — Preserve a known baseline       | Record HEAD and user-owned changes; verify the existing prototype remains independently runnable; define the goal's public test boundaries                                              | An experiment cannot be safely separated from pre-existing edits                                         | Baseline and protected files recorded; recovery is limited to experiment-owned edits; agreed test boundaries before test writing                                                                 |
| M1 — Reproducible runnable workspace | Establish minimal npm workspaces for React and NestJS with independent startup/build commands, strict TypeScript and a compatible pinned runtime                                        | Dependency compatibility, module resolution, workspace import/export or unavailable browser/test tooling | Install from a committed lockfile; both minimal apps start and build; frontend and API behavior tests can run; tooling rationale recorded in English                                             |
| M2 — One shared health contract      | Define a proposed GET /health operation and a minimal success payload; validate OpenAPI, generate transport types and demonstrate a schema-derived runtime parser                       | Code generator and validator disagree, generation is not reproducible, shared package cannot be consumed | A valid health fixture is accepted; malformed data is rejected; types regenerate without drift; both consumers type-check without unsafe assertions                                              |
| M3 — Nest fulfills the contract      | Through the public HTTP boundary, write one health success test, observe RED, add the minimum endpoint, observe GREEN and review responsibilities                                       | HTTP test setup, response validation or contract mapping does not work with the chosen toolchain         | Actual Nest HTTP response has the agreed status/payload and passes runtime schema validation; endpoint test passes; no database dependency                                                       |
| M4 — React handles the contract      | Exercise the page with the actual Redux provider, RTK Query client and intercepted HTTP; add loading → reachable, unreachable/retry and malformed-response cases one behavior at a time | Provider wiring, validation integration, timing or accessible state feedback                             | Real UI/store/client cooperation passes; the malformed response never becomes a healthy state; retry reflects the new response; generated types are used                                         |
| M5 — Connect the actual applications | Replace development interception for this path with the actual Nest service; verify reachable, loading and request-failure behavior                                                     | Base URL, environment parsing, CORS/proxy setup, response content or timeout behavior                    | Browser request demonstrably reaches Nest; stopping the API yields an unreachable state; restarting and retrying recovers; slow transport permits observing loading; no production mock fallback |
| M6 — Reproduce from a fresh checkout | Re-run documented install/start/build/check commands in an isolated clean checkout, supplying environment values from the example                                                       | Hidden local files, untracked generated artifacts, secrets, port conflicts or undocumented setup         | Independent web/API builds, contract generation/validation and relevant tests pass; fresh-checkout browser journey works; instructions require no committed secrets                              |

Do not write all tests in advance. At each behavioral node choose one example, observe its meaningful RED, implement the smallest GREEN and refactor before choosing the next. Installation/scaffold commands need direct verification, not tests that merely mirror configuration files. Scaffold-generated tests do not count as our health-behavior TDD evidence.

### Proposed public test seams

- **Contract:** parser input/output for untrusted health JSON, plus spec and generation checks. TypeScript types alone do not validate HTTP.
- **API:** request → actual Nest HTTP response. Avoid controller-method call-count assertions.
- **Frontend:** interaction → visible state with the real store/providers/client and network interception. Avoid mocked RTK Query hook results.
- **Connected journey:** browser → actual HTTP → Nest. This can establish end-to-end health behavior without a database; PostgreSQL is deliberately absent from #1.

All four seams were explicitly approved before implementation. See the implementation record for actual test and browser evidence.

## Proposed behavior examples

| Boundary     | Example                                            | Expected result                                       |
| ------------ | -------------------------------------------------- | ----------------------------------------------------- |
| HTTP         | GET /health succeeds                               | 200 plus the contract-defined liveness payload        |
| Parser       | Response contains the wrong health status or shape | Validation failure; never render a false success      |
| UI           | Health response is pending                         | Accessible loading feedback                           |
| UI           | Valid health response arrives                      | Reachable API state                                   |
| UI           | Transport fails / request times out                | Unreachable feedback and an available retry action    |
| UI           | Retry succeeds after an outage                     | Reachable feedback replaces the failure               |
| Real journey | API is stopped and subsequently restarted          | Actual browser state follows the service availability |

The precise payload, error mapping and timeout policy are decisions for M2/M4. Examples above are acceptance proposals, not an already implemented API contract.

## Experiment / undo rule

1. Pick one currently unblocked node and state the observable result expected from the attempt.
2. Make the smallest attempt; run the relevant command or public behavior test.
3. If blocked, record the error, prerequisite and why the dependency is necessary. Add the minimum node/edge; do not troubleshoot unrelated scope.
4. Undo only the unsuccessful experiment's changes, including its temporary failing probe when appropriate. Retain the graph and findings. Preserve all previously working changes and user edits; never use a blanket destructive reset/clean as the undo mechanism.
5. Reconfirm the baseline, then tackle the newly exposed prerequisite. Keep a completed step only after its own evidence is green.

A planned RED is expected TDD evidence, not a technical retry. A failed tool operation that must be repeated is a retry. A discovered design prerequisite is Mikado exploration; record it separately from user-requested corrections. If a genuine dependency cycle appears, reconsider the interface or find a smaller atomic change rather than pretending an unblocked leaf exists.

## Experiment record

| Attempt | Target node | Hypothesis                                                        | Observed result                                      | New prerequisite | Undo scope / baseline           | Outcome |
| ------- | ----------- | ----------------------------------------------------------------- | ---------------------------------------------------- | ---------------- | ------------------------------- | ------- |
| E0      | G           | Missing runnable application foundations block the health journey | Not run; repository absence observed during planning | M0/M1 proposed   | No implementation edits to undo | Planned |

For each actual attempt record start/end, skill use (or None), relevant check output, retries and whether the change was kept or undone. The engineering log holds raw evidence; Linear retains cross-project methodology interpretation.

## Exit condition for G

- [x] Isolated clean candidate and reproducible lockfile install are verified; a checkout of the published commit remains pending.
- [x] React and Nest start and build independently using documented commands and environment examples.
- [x] A validated OpenAPI health contract generates transport types; runtime validation rejects malformed responses.
- [x] Loading, reachable, unreachable and retry behavior work through the actual RTK Query client.
- [x] A real browser request reaches Nest; stopping/restarting the API changes the visible result without mock fallback.
- [x] Relevant integration checks pass, with meaningful RED/GREEN/refactor evidence and explicit limits of mocked tests.
- [x] Composition, HTTP/validation and presentation responsibilities are separate; styling and text are ready for later theme/locale replacement without implementing those features now.
- [x] Existing prototypes are preserved; tooling choices, test boundaries and clean candidate evidence are recorded in English.

The ticket is not Done merely because every planned node has a file. Compare the delivered journey against the live issue's acceptance criteria. Any missing mandatory behavior returns G to blocked within this graph; the GitHub ticket stays open until actual completion.

## Implementation record — S41

The baseline was recorded and prototype files preserved (M0). Node 24.18.1 and npm 11.16.0 were selected and pinned with exact dependencies and a lockfile (M1). A real setup attempt exposed Nest 12's ESM compatibility prerequisite: CommonJS compilation failed with TS1479; switching the API module configuration restored a runnable test boundary. The incompatible setup was replaced before continuing, without resetting working changes.

OpenAPI 3.0.3 defines GET `/health`, with generated TypeScript types and a schema-derived runtime parser (M2). The actual HTTP test first received 404, then passed with the minimal controller (M3). Incremental UI tests exposed reachable, failure/retry and invalid-response gaps; implementing each behavior restored GREEN before presentation refactoring (M4). The browser used the real Nest service and demonstrated outage/recovery plus loading (M5). A clean candidate snapshot passed `npm ci`, the full checks and documented startup on alternate ports (M6).

Thirteen repository tests pass; the real connected browser journey was observed manually through browser automation. A delayed network integration test verifies loading deterministically. Six meaningful RED/GREEN cycles, tool recoveries, timestamps and applied skills are documented in [S41 evidence](../engineering/sessions/2026-10-01-foundation-health-implementation.md). Runtime choices are recorded in [ADR 0004](../architecture/adr/0004-foundation-toolchain-and-health-contract.md).

The earlier E0 row remains a historical planning observation. Expected TDD REDs were kept while implementing their GREEN behavior; they were not unsuccessful Mikado experiments requiring undo. No additional dependency edges were needed after resolving module compatibility. G remains pending review/publication: this branch is uncommitted and issue #1 remains open. Verification of a remote checkout requires publication first.

### Method source

[Daniel Brolund: Start Paying your Technical Debt — The Mikado Method](https://danielbrolund.wordpress.com/2009/03/28/start-paying-your-technical-debt-the-mikado-method/) describes goal-led experiments, prerequisite recording, undo and implementation from leaves. The particular AEKI graph and examples are our proposed application of that method.

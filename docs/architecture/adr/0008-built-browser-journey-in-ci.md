# ADR 0008: Built Browser Journey in CI

Date: 2026-10-05. Status: Accepted through the approved issue #3 Mikado plan.

## Context

React integration, Nest HTTP and PostgreSQL tests passed independently. They do not prove that a browser can reach the built frontend, its actual RTK Query requests, the built backend and the database through the same route.

## Decision

Use exact Playwright Test 1.63.0 with its full Chromium headless channel, one worker and zero retries. Install Chromium with `--no-shell`; CI also installs Linux system dependencies. Use a real browser and the built applications, without intercepted responses or database stubs.

The public `npm run test:browser` command builds the applications and then rebuilds the frontend in `browser-test` mode. That mode ignores developer environment files and fixes the browser API path to `/api/`. The preview proxy targets the owned API through the runner's environment. Developer configuration cannot redirect this journey to a nonlocal API.

The runner reserves distinct loopback ports and creates a uniquely named Compose project using the existing test database conventions. It applies actual migrations and runs Playwright. Playwright owns the API and preview processes, refuses existing servers, and waits up to 30 seconds per server. The browser test checks readiness, stops only the owned PostgreSQL service, verifies HTTP 503 and independent liveness, restarts PostgreSQL and retries to verify HTTP 200 and UI recovery. Storage persists across the outage and is removed after the run.

Use the published `tree-kill` 1.2.2 process boundary for Windows and Linux interruption and the runner's three-minute browser deadline. Await child termination before database cleanup. Always attempt owned cleanup even when startup or log collection fails. Cleanup failure cannot become a passing exit code. SIGKILL of the runner itself and machine failure cannot guarantee cleanup; CI runners are disposable and local resource ownership is explicit.

Keep the existing required `Quality gate` job. Run all existing checks and 100% per-file coverage before browser installation and the connected journey. Preserve HTML reports, failure screenshots/traces and service logs for 14 days, using explicit artifact directories. Keep service logs outside `test-results`, which Playwright clears. Reset them per invocation and redact PostgreSQL URLs and test credentials before writing. Do not upload environment files or raw conversation evidence.

## Consequences and review trigger

This adds real connection and outage evidence, startup cost and a Chromium download dependency. A download failure is an infrastructure failure; no automatic test retry hides it. Percentage coverage still applies to handwritten executable runner tooling; browser tests complement it. The preview server is a test host, not a production deployment decision.

Revisit for another browser, product navigation, authentication, non-test data in traces, repeated infrastructure failures, parallel workers or a changed job duration budget. Deliberate remote contract/browser failures must fail the same required outcome before accepting issue #3.

References: [Playwright CI](https://playwright.dev/docs/ci), [Chromium headless channel](https://playwright.dev/docs/browsers#chromium-new-headless-mode), [Vite preview proxy](https://vite.dev/config/preview-options#preview-proxy), [tree-kill](https://github.com/pkrumins/node-tree-kill).

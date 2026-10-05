# Browser Journey and CI Evidence

## Reproduce locally

Use the pinned Node/npm versions and a running Docker daemon with Compose. From the repository root:

```sh
npm ci
npx --no-install playwright install --no-shell chromium
npm run check
npm run test:browser
```

On Linux, install Chromium with `--with-deps --no-shell chromium`, as CI does. `test:browser` builds its own application assets; it does not reuse a developer API or database. Invoke it from the repository root. The underlying `node scripts/run-browser-tests.mjs` command expects built assets; it forwards Playwright CLI arguments for targeted diagnosis.

The single journey checks visible API/database status, a real PostgreSQL outage, actual readiness HTTP 503, continued valid health HTTP 200, and database recovery through the UI retry. It uses one worker and zero retries. It covers foundation connectivity, not search or schema completeness.

## Failure investigation

`browser-services/browser.log` contains browser output plus prefixed API and preview logs. `database.log` contains isolated PostgreSQL logs; `runner.log` contains startup/cleanup diagnostics. They are reset per invocation and retained outside Playwright's cleared output directory. PostgreSQL URLs and test passwords are redacted before persistence. No environment dump is collected.

The HTML report is in `playwright-report/`. Failed assertions retain `test-results/**/trace.zip`, a screenshot and error context. Open with `npx --no-install playwright show-report` or `show-trace <trace-path>`. Only local test data belongs in these artifacts; traces record request/response evidence and must be reviewed before publishing new kinds of data.

The runner owns a unique `aeki-test-<pid>-<timestamp>` Compose project, three ephemeral loopback ports and a per-run volume. It cleans them on success, failed startup, failed assertions and handled interruption. Browser timeout kills the owned process tree; cleanup failure returns failure. An abrupt machine or runner kill is outside this guarantee. Do not remove unrelated projects or volumes.

## Required remote proof

The existing `Quality gate` includes formatting, contracts, types, lint, all four coverage gates, builds and this journey. Explicit coverage and browser artifact paths have 14-day retention. A green browser test cannot override a failed earlier gate.

Issue #3 also requires actual successful Actions evidence and separate deliberately failing contract/browser branches, with the browser artifacts inspected. See the implementation session for observed run URLs and cleanup evidence. Temporary proof mutations must remain off the implementation branch and main. Their failures are planned negative tests, not technical retries.

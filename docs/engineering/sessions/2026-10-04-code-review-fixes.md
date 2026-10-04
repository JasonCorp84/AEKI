# S52 — Apply Code Review Fixes

Csaba explicitly requested fixes for the complete issue #2 / measurement review. Four distinct findings were in scope: historical-exemption bypass (reported on both review axes), impossible calendar dates, outdated recovered timing documentation and missing implemented C4 foundation boundaries.

Actual start: `2026-10-04T04:08:22.575Z`, from the task-start event. Applied skill: `tdd`, freshly reloaded; the previously approved extraction, row validation and CLI seams were reused without another approval request. No subagents or new dependency were needed. Completion remains open until the next turn can reconcile its actual event. Human active time is not measured.

## Fixes and evidence

- Historical exemptions now require an exact match against the frozen original step/turn-ID/start metadata in `historical-measurement-identities.json`. IDs are canonical and chronologically increasing. The new regression failed on `S1` before the fix; afterward it rejects aliases, zero IDs and replacement tasks using `S01`/`S14`, while the authentic S14 still receives its documented historical warning.
- Calendar values must round-trip through parsing/ISO serialization unchanged. The February 31 regression failed before the fix. Both event extraction and row validation now reject it; an actual leap day with second-only UTC precision remains valid. Real CLI fixtures also return exit code 1 for the impossible date and unaudited alias.
- S45/S46 evidence now includes exact task-start/completion events and 989.148/1489.125 seconds, preserving original checkpoints and unmeasured human/token data. S50 and S51 received dated completion reconciliation notes.
- A separate current foundation C4 component view shows React → health/readiness controllers → probe → PostgreSQL. The container document adds implemented boundaries; target product diagrams remain explicitly planned. Existing exported target SVG sources were not changed. Mermaid source was checked against the actual module/controller/probe code; a new rendered export is not claimed.

## Verification and Docker interruption

Ten measurement tests pass (two new RED/GREEN regression slices), alongside sixteen contract and fifteen React tests: **41 Docker-independent tests**. Lint, strict type checks and both production builds passed. The actual measurement log check passes with the explicit legacy warnings. No product code changed in these fixes.

The combined `npm run check` reached the database suite but failed because the Docker Linux engine pipe was absent. `docker desktop start --timeout 45` failed to complete startup; the user supplied a Docker Desktop crash screenshot and diagnostic reference. A supported `docker desktop stop --timeout 20` also timed out with Desktop/backend processes still running. The local backend log confirmed the OTel manager could not remove `userAnalyticsOtlpHttp.sock`: “The file cannot be accessed by the system.” This is environment evidence, not a validated diagnosis of permissions or a fix for Docker.

Technical retry audit: **1**, the failed sandbox Docker-log read repeated with elevated read access and succeeded. The failed combined check, Desktop start and stop were initial failed operations; the selective Docker-independent check was a method fallback, not a repeat of the full check. Expected regression REDs are not technical retries. No user-requested artifact correction occurred during implementation; the screenshot/Diagnostic ID supplied environmental context.

The nine real PostgreSQL/API/migration tests need rerunning after Docker is available. Earlier successful integration evidence remains historical; this fix task does not claim a fresh database pass. No factory reset, volume deletion, ACL modification, diagnostic upload or process force-termination was performed.

No commit or push was requested for these fixes. The earlier review report is retained as a snapshot; its four distinct findings are addressed by the changes above.

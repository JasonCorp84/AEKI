# Issue #3 — Built Browser Journey in CI

Status: implementation in progress; user explicitly approved the Mikado plan and its three test boundaries.

## Baseline and scope

Implementation branch: `codex/ci-browser-journey`, based on current `origin/main` at `71a29c9`. The separately captured engineering dashboard is excluded. No deployment or product search work is included.

Skills: `tdd` (reused), `pr` (review handoff). Techniques: approved public seams, one vertical RED/GREEN slice at a time, actual PostgreSQL/Nest/browser connection checks, safe artifact inspection, owned process cleanup and remote negative proof. No sub-agents were delegated for this implementation.

## Observed experiments

- Pinned Playwright Test 1.63.0 accepts Node >=20; the project uses 24.18.1. Chromium full-channel launch and the initial built application journey passed on Windows.
- The optional headless-shell download failed with connection reset, timeouts and DNS errors. Full Chromium had downloaded successfully. The committed full Chromium channel uses the documented `--no-shell` installation, without a machine-specific executable path.
- The first public runner test failed because the runner did not exist; implementation passed while preserving a real child exit code of 7 and redacted diagnostics.
- A real run exposed Playwright clearing `test-results`, deleting service logs and preventing teardown. Move service logs outside that directory. The two affected owned probe projects were explicitly removed; no unrelated resources were removed.
- Failed startup with unavailable database logs first escaped cleanup. Its RED/GREEN test now verifies that the owned project is still removed.
- The browser outage assertion first failed while PostgreSQL remained available. After adding the real stop/restart stimulus, visible outage/recovery passed.
- Interruption RED exposed a hung real child. The process-tree boundary now terminates it before database cleanup; real child, deadline, setup interruption and failed cleanup checks passed on Windows.
- A real missing child executable produced a negative OS exit code. Normalize it to a failing exit code of 1; the public test passed.
- A stale-evidence RED showed earlier logs surviving into a new run. Reset only the three owned log files per invocation; the regression passed.

Artifact storage loss also produced a genuine RED: a filesystem error bypassed database cleanup. The nested cleanup guarantee passed after correction.

Local final `npm run check` passed: 104 tests and all four metrics at 100% for 30 inventoried executable files. The independently installed candidate passed `npm ci` and all checks (tree `dded7b6e9e1a78d6be0aa4cb836ad300d7e74308`). After the final artifact-storage correction, the root full check passed again and the final browser command passed both in the root and in that independently installed checkout updated with the correction. The independent browser run removed its owned project and volume.

Audited technical recovery attempts at this checkpoint: **7**. They are the browser installation recovery, Compose cleanup rerun with its required port variable, formatter rerun after its unsafe-finally rejection, quality-gate rerun after missing coverage branches, measurement-gate rerun after correcting the new retry field, coverage rerun after an overlapping source edit invalidated its mapping, and replacement of a failed PowerShell process-stop attempt with verified owned-PID `taskkill`. Expected TDD REDs, Mikado dependency discoveries, planned remote failures and successful fresh verification are separate categories. The deleted-log-directory probes and corrections are explicitly recorded above rather than counted as acceptance corrections.

Remote run evidence and artifact inspection remain pending at this checkpoint.

## Timing

Turn ID: `01a10c49-e7ae-7f60-84fe-453fd2da534f`. Recorded start: `2026-10-05T13:38:52.615Z`. The completed-turn event does not exist until delivery, so its duration remains pending rather than fabricated. The CSV checkpoint records observable progress, not human active time.

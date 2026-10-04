import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseMeasurementCsv, serializeMeasurementCsv } from './measurement-csv.mjs';

test('reconciliation previews explicit log timing without modifying it, then writes on request', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aeki-reconciliation-'));
  const logPath = join(directory, 'turns.csv');
  const eventsPath = join(directory, 'events.jsonl');
  const originalRow = {
    step: 'S54',
    turn_id: 'example-turn',
    started_at_utc: 'unknown',
    ended_at_utc: 'unknown',
    assistant_turn_wall_seconds: 'unknown',
    status: 'in progress',
    delivery_checkpoint_utc: '2026-10-04T00:00:01Z',
  };
  const originalCsv = serializeMeasurementCsv([originalRow]);
  writeFileSync(logPath, originalCsv);
  writeFileSync(
    eventsPath,
    [
      '',
      JSON.stringify({ type: 'unrelated' }),
      JSON.stringify({ type: 'event_msg' }),
      JSON.stringify({
        timestamp: '2026-10-04T00:00:00Z',
        type: 'event_msg',
        payload: { type: 'task_started', turn_id: 'example-turn' },
      }),
      JSON.stringify({
        timestamp: '2026-10-04T00:00:02.500Z',
        type: 'event_msg',
        payload: { type: 'task_complete', turn_id: 'example-turn' },
      }),
    ].join('\n'),
  );
  const run = (extraArguments = []) =>
    spawnSync(
      process.execPath,
      [
        'scripts/reconcile-engineering-measurements.mjs',
        '--events',
        eventsPath,
        '--log',
        logPath,
        ...extraArguments,
      ],
      { encoding: 'utf8' },
    );
  const preview = run();
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /Dry run: 1 timing rows/);
  assert.equal(readFileSync(logPath, 'utf8'), originalCsv);
  assert.equal(run(['--write']).status, 0);
  const [updated] = parseMeasurementCsv(readFileSync(logPath, 'utf8'));
  assert.equal(updated.assistant_turn_wall_seconds, '2.500');
  assert.equal(updated.ended_at_utc, '2026-10-04T00:00:02.500Z');
  assert.match(run().stdout, /Dry run: 0 timing rows/);
  writeFileSync(
    logPath,
    serializeMeasurementCsv([
      { ...originalRow, turn_id: 'unknown' },
      { ...originalRow, step: 'S55', turn_id: 'no-match' },
    ]),
  );
  assert.match(run().stdout, /Dry run: 1 timing rows/);
  writeFileSync(
    eventsPath,
    JSON.stringify({
      timestamp: '2026-10-04T00:00:00Z',
      type: 'event_msg',
      payload: { type: 'task_started', turn_id: 'example-turn' },
    }),
  );
  writeFileSync(logPath, originalCsv);
  assert.equal(run(['--write']).status, 0);
  const [unfinished] = parseMeasurementCsv(readFileSync(logPath, 'utf8'));
  assert.equal(unfinished.ended_at_utc, 'unknown');
  assert.equal(unfinished.assistant_turn_wall_seconds, 'unknown');
});

test('reconciliation refuses missing event paths, malformed events and ambiguous historical matches', () => {
  const run = (args) =>
    spawnSync(process.execPath, ['scripts/reconcile-engineering-measurements.mjs', ...args], {
      encoding: 'utf8',
    });
  for (const args of [[], ['--events'], ['--events', '--write']]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Provide --events/);
  }
  const directory = mkdtempSync(join(tmpdir(), 'aeki-ambiguous-reconciliation-'));
  const logPath = join(directory, 'turns.csv');
  const eventsPath = join(directory, 'events.jsonl');
  writeFileSync(
    logPath,
    serializeMeasurementCsv([
      { step: 'S54', turn_id: 'unknown', delivery_checkpoint_utc: '2026-10-04T00:00:01Z' },
    ]),
  );
  const events = ['first', 'second'].flatMap((turnId) => [
    {
      timestamp: '2026-10-04T00:00:00Z',
      type: 'event_msg',
      payload: { type: 'task_started', turn_id: turnId },
    },
    {
      timestamp: '2026-10-04T00:00:02Z',
      type: 'event_msg',
      payload: { type: 'task_complete', turn_id: turnId },
    },
  ]);
  writeFileSync(eventsPath, events.map((event) => JSON.stringify(event)).join('\n'));
  assert.match(run(['--events', eventsPath, '--log', logPath]).stderr, /Ambiguous turn match/);
  writeFileSync(eventsPath, 'invalid JSON');
  assert.match(
    run(['--events', eventsPath, '--log', logPath]).stderr,
    /Measurement reconciliation failed/,
  );
  writeFileSync(eventsPath, '');
  assert.equal(run(['--events', eventsPath]).status, 0);
});

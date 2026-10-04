import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { extractTurnTimings, validateMeasurementRows } from './engineering-measurements.mjs';

const completedMeasurement = {
  step: 'S48',
  task: 'Explain dependency lockfile',
  turn_id: 'example-turn',
  started_at_utc: '2026-10-03T10:00:00.000Z',
  ended_at_utc: '2026-10-03T10:00:02.500Z',
  assistant_turn_wall_seconds: '2.500',
  status: 'completed',
  technical_retry_count: '0',
  human_active_seconds: 'not measured',
  skills_applied: 'None',
  skill_evidence: 'No skill applied; verified local files.',
  delivery_checkpoint_utc: '2026-10-03T10:00:02.000Z',
};

test('pairs interleaved turn events by ID and excludes idle gaps between turns', () => {
  const events = [
    {
      timestamp: '2026-10-03T10:00:00.000Z',
      type: 'event_msg',
      payload: { type: 'task_started', turn_id: 'first' },
    },
    {
      timestamp: '2026-10-03T10:00:02.500Z',
      type: 'event_msg',
      payload: { type: 'task_complete', turn_id: 'first' },
    },
    {
      timestamp: '2026-10-04T10:00:00.000Z',
      type: 'event_msg',
      payload: { type: 'task_started', turn_id: 'second' },
    },
    {
      timestamp: '2026-10-04T10:00:03.000Z',
      type: 'event_msg',
      payload: { type: 'task_complete', turn_id: 'second' },
    },
  ];
  assert.deepEqual(extractTurnTimings(events), [
    {
      turnId: 'first',
      startedAtUtc: '2026-10-03T10:00:00.000Z',
      endedAtUtc: '2026-10-03T10:00:02.500Z',
      wallSeconds: 2.5,
    },
    {
      turnId: 'second',
      startedAtUtc: '2026-10-04T10:00:00.000Z',
      endedAtUtc: '2026-10-04T10:00:03.000Z',
      wallSeconds: 3,
    },
  ]);
});

test('measurement command accepts valid CSV and rejects invalid timing and unaudited ID aliases', (context) => {
  const fixtureDirectory = mkdtempSync(join(tmpdir(), 'aeki-measurement-test-'));
  const fixturePath = join(fixtureDirectory, 'measurements.csv');
  context.after(() => {
    unlinkSync(fixturePath);
    rmdirSync(fixtureDirectory);
  });
  const fields = Object.keys(completedMeasurement);
  function writeFixture(row) {
    const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
    writeFileSync(
      fixturePath,
      [fields.map(quote).join(','), fields.map((field) => quote(row[field])).join(',')].join(
        '\r\n',
      ),
    );
  }
  const commandPath = new URL('./check-engineering-measurements.mjs', import.meta.url);
  const runMeasurementCheck = () =>
    spawnSync(process.execPath, [fileURLToPath(commandPath), fixturePath], { encoding: 'utf8' });
  writeFixture({ ...completedMeasurement, task: 'Check "quoted", multiline\nmeasurement' });
  const validResult = runMeasurementCheck();
  assert.equal(validResult.status, 0, validResult.stderr);
  writeFixture({ ...completedMeasurement, ended_at_utc: 'unknown' });
  const invalidResult = runMeasurementCheck();
  assert.equal(invalidResult.status, 1);
  assert.match(invalidResult.stderr, /S48.*ended_at_utc/);
  writeFixture({
    ...completedMeasurement,
    started_at_utc: '2026-02-31T10:00:00.000Z',
    ended_at_utc: '2026-03-03T10:00:02.000Z',
    assistant_turn_wall_seconds: '2',
  });
  const invalidDateResult = runMeasurementCheck();
  assert.equal(invalidDateResult.status, 1);
  assert.match(invalidDateResult.stderr, /S48.*started_at_utc/);
  writeFixture({ ...completedMeasurement, step: 'S1', technical_retry_count: 'not audited' });
  const aliasResult = runMeasurementCheck();
  assert.equal(aliasResult.status, 1);
  assert.match(aliasResult.stderr, /S1.*technical_retry_count/);
});

test('rejects a completed measurement with an unknown completion instead of treating it as zero', () => {
  const result = validateMeasurementRows([
    { ...completedMeasurement, ended_at_utc: 'unknown', assistant_turn_wall_seconds: 'unknown' },
  ]);
  assert.ok(result.errors.some((error) => error.includes('S48') && error.includes('ended_at_utc')));
});

test('rejects contradictory duration and reversed timestamps, but accepts independently known elapsed time', () => {
  assert.deepEqual(validateMeasurementRows([completedMeasurement]).errors, []);
  assert.ok(
    validateMeasurementRows([
      { ...completedMeasurement, assistant_turn_wall_seconds: '0' },
    ]).errors.some((error) => error.includes('duration')),
  );
  assert.ok(
    validateMeasurementRows([
      { ...completedMeasurement, ended_at_utc: '2026-10-03T09:59:59.000Z' },
    ]).errors.some((error) => error.includes('precedes')),
  );
});

test('requires an audited retry count, skill evidence and turn ID for new measurements', () => {
  for (const [field, value] of [
    ['technical_retry_count', 'not audited'],
    ['skills_applied', 'unknown'],
    ['skill_evidence', ''],
    ['turn_id', 'unknown'],
  ]) {
    assert.ok(
      validateMeasurementRows([{ ...completedMeasurement, [field]: value }]).errors.some((error) =>
        error.includes(field),
      ),
      field,
    );
  }
});

test('keeps historical missing evidence visible and permits only the final row to be in progress', () => {
  const historical = {
    ...completedMeasurement,
    step: 'S14',
    turn_id: '01a0f644-8fa9-7173-9946-fb1ec4aeff80',
    started_at_utc: '2026-10-01T07:01:23.570Z',
    ended_at_utc: 'unknown',
    assistant_turn_wall_seconds: 'unknown',
    technical_retry_count: 'not audited',
  };
  const result = validateMeasurementRows([historical]);
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some((warning) => warning.includes('S14')));
  const active = {
    ...completedMeasurement,
    status: 'in progress',
    ended_at_utc: 'unknown',
    assistant_turn_wall_seconds: 'unknown',
  };
  assert.deepEqual(validateMeasurementRows([active]).errors, []);
  assert.ok(
    validateMeasurementRows([active, { ...completedMeasurement, step: 'S49' }]).errors.some(
      (error) => error.includes('in progress'),
    ),
  );
});

test('never invents an end for an interrupted turn and rejects conflicting timing evidence', () => {
  const started = {
    timestamp: '2026-10-03T10:00:00.000Z',
    type: 'event_msg',
    payload: { type: 'task_started', turn_id: 'unfinished' },
  };
  assert.deepEqual(extractTurnTimings([started]), [
    {
      turnId: 'unfinished',
      startedAtUtc: '2026-10-03T10:00:00.000Z',
      endedAtUtc: null,
      wallSeconds: null,
    },
  ]);
  assert.throws(
    () => extractTurnTimings([started, { ...started, timestamp: '2026-10-03T10:00:01.000Z' }]),
    /Conflicting timing/,
  );
  assert.throws(
    () =>
      extractTurnTimings([
        { ...started, payload: { type: 'task_complete', turn_id: 'unfinished' } },
      ]),
    /no start/,
  );
});

test('rejects missing start, duplicate task IDs and an empty measurement log', () => {
  assert.ok(
    validateMeasurementRows([{ ...completedMeasurement, started_at_utc: 'unknown' }]).errors.some(
      (error) => error.includes('started_at_utc'),
    ),
  );
  assert.ok(
    validateMeasurementRows([completedMeasurement, completedMeasurement]).errors.some((error) =>
      error.includes('unique'),
    ),
  );
  assert.ok(validateMeasurementRows([]).errors.length > 0);
});

test('new records cannot inherit historical retry exemptions through aliases or reused low IDs', () => {
  for (const step of ['S1', 'S00', 'S001', 'S01', 'S14']) {
    const validation = validateMeasurementRows([
      { ...completedMeasurement, step, technical_retry_count: 'not audited' },
    ]);
    assert.ok(
      validation.errors.some((error) => error.includes('technical_retry_count')),
      step,
    );
  }
});

test('rejects normalized impossible calendar dates while accepting actual leap days', () => {
  const invalid = {
    ...completedMeasurement,
    started_at_utc: '2026-02-31T10:00:00.000Z',
    ended_at_utc: '2026-03-03T10:00:02.000Z',
    assistant_turn_wall_seconds: '2',
  };
  assert.ok(
    validateMeasurementRows([invalid]).errors.some((error) => error.includes('started_at_utc')),
  );
  const valid = {
    ...completedMeasurement,
    started_at_utc: '2024-02-29T10:00:00Z',
    ended_at_utc: '2024-02-29T10:00:02Z',
    assistant_turn_wall_seconds: '2',
  };
  assert.deepEqual(validateMeasurementRows([valid]).errors, []);
  assert.throws(
    () =>
      extractTurnTimings([
        {
          timestamp: invalid.started_at_utc,
          type: 'event_msg',
          payload: { type: 'task_started', turn_id: 'invalid-date' },
        },
      ]),
    /Invalid timing/,
  );
});

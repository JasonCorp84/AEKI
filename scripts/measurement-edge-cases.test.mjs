import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  parseMeasurementCsv,
  serializeMeasurementCsv,
} from './measurement-csv.mjs';
import {
  extractTurnTimings,
  validateMeasurementRows,
} from './engineering-measurements.mjs';
import {spawnSync} from 'node:child_process';

test('CSV round-trips escaped quotes, embedded newlines, empty cells and CRLF input', () => {
  const rows = [
    {task: 'say "hello"\nagain', notes: '', optional: undefined},
    {task: 'next', notes: 'done', optional: 'value'},
  ];
  const serialized = serializeMeasurementCsv(rows);
  assert.deepEqual(
    parseMeasurementCsv('\uFEFF' + serialized.replaceAll('\n', '\r\n')),
    [
      {task: 'say "hello"\nagain', notes: '', optional: ''},
      {task: 'next', notes: 'done', optional: 'value'},
    ],
  );
  assert.deepEqual(parseMeasurementCsv('task,notes\nnext,done'), [
    {task: 'next', notes: 'done'},
  ]);
  assert.deepEqual(parseMeasurementCsv('task,notes\n,\n'), []);
  assert.deepEqual(parseMeasurementCsv('task\n'), []);
});

test('CSV parser rejects malformed headers, unclosed quotations and inconsistent columns', () => {
  for (const csv of [
    '',
    'task,task\nfirst,second\n',
    'task\n"unfinished',
    'task,notes\none\n',
  ])
    assert.throws(() => parseMeasurementCsv(csv));
});

test('event extraction ignores unrelated metadata but refuses missing identity and invalid time', () => {
  assert.deepEqual(
    extractTurnTimings([
      {type: 'other'},
      {type: 'event_msg'},
      {type: 'event_msg', payload: {type: 'unrelated'}},
    ]),
    [],
  );
  assert.throws(
    () =>
      extractTurnTimings([
        {type: 'event_msg', payload: {type: 'task_started'}},
      ]),
    /no turn ID/,
  );
  for (const timestamp of [
    undefined,
    '2026-00-01T00:00:00Z',
    '2026-02-31T00:00:00Z',
  ])
    assert.throws(
      () =>
        extractTurnTimings([
          {
            type: 'event_msg',
            payload: {type: 'task_started', turn_id: 'example'},
            timestamp,
          },
        ]),
      /Invalid timing/,
    );
  assert.throws(
    () =>
      extractTurnTimings([
        {
          timestamp: '2026-10-04T00:00:02Z',
          type: 'event_msg',
          payload: {type: 'task_started', turn_id: 'reversed'},
        },
        {
          timestamp: '2026-10-04T00:00:01Z',
          type: 'event_msg',
          payload: {type: 'task_complete', turn_id: 'reversed'},
        },
      ]),
    /Completion precedes start/,
  );
});

test('measurement checker reports missing files through its real command boundary', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/check-engineering-measurements.mjs', 'definitely-missing.csv'],
    {encoding: 'utf8'},
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Measurement check failed/);
  const originalLog = spawnSync(
    process.execPath,
    ['scripts/check-engineering-measurements.mjs'],
    {
      encoding: 'utf8',
    },
  );
  assert.equal(originalLog.status, 0, originalLog.stderr);
  assert.match(originalLog.stderr, /Historical evidence warning/);
});

test('measurement validation rejects missing identifiers, empty required values and nonnumeric durations', () => {
  const base = {
    step: 'S54',
    task: 'validate',
    turn_id: 'turn',
    started_at_utc: '2026-10-04T00:00:00Z',
    ended_at_utc: '2026-10-04T00:00:01Z',
    assistant_turn_wall_seconds: '1',
    status: 'completed',
    technical_retry_count: '0',
    skills_applied: 'None',
    skill_evidence: 'No skill used.',
  };
  for (const override of [
    {step: undefined},
    {task: ''},
    {task: 'unknown'},
    {skills_applied: 'not audited'},
    {turn_id: undefined},
    {technical_retry_count: undefined},
    {started_at_utc: undefined},
    {ended_at_utc: undefined},
    {assistant_turn_wall_seconds: undefined},
    {assistant_turn_wall_seconds: ''},
    {assistant_turn_wall_seconds: 'not a number'},
  ])
    assert.ok(validateMeasurementRows([{...base, ...override}]).errors.length);
  assert.ok(
    validateMeasurementRows([{...base, step: 'S55'}, base]).errors.some(error =>
      error.includes('chronological'),
    ),
  );
  assert.deepEqual(validateMeasurementRows([base]).errors, []);
  assert.ok(
    validateMeasurementRows([{...base, status: 'in progress'}]).errors.some(
      error => error.includes('must not claim completion'),
    ),
  );
  assert.ok(
    validateMeasurementRows([
      {...base, status: 'in progress', ended_at_utc: 'unknown'},
    ]).errors.some(error => error.includes('must not claim completion')),
  );
});

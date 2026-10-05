import historicalIdentities from '../docs/engineering/historical-measurement-identities.json' with {type: 'json'};

const historicalIdentityByStep = new Map(
  historicalIdentities.map(identity => [identity.step, identity]),
);

function isValidUtcTimestamp(timestamp) {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(timestamp ?? '')
  )
    return false;
  const parsedTime = Date.parse(timestamp);
  if (!Number.isFinite(parsedTime)) return false;
  const timestampWithMilliseconds = timestamp.includes('.')
    ? timestamp
    : timestamp.replace('Z', '.000Z');
  // Date.parse normalizes impossible dates; the original calendar values must survive unchanged.
  return new Date(parsedTime).toISOString() === timestampWithMilliseconds;
}

export function extractTurnTimings(events) {
  const timingsByTurnId = new Map();
  for (const event of events) {
    if (
      event.type !== 'event_msg' ||
      !['task_started', 'task_complete'].includes(event.payload?.type)
    )
      continue;
    const turnId = event.payload.turn_id;
    if (!turnId) throw new Error('Timing event has no turn ID.');
    const eventTime = Date.parse(event.timestamp);
    if (!isValidUtcTimestamp(event.timestamp))
      throw new Error(`Invalid timing event for ${turnId}.`);
    const timing = timingsByTurnId.get(turnId) ?? {turnId};
    const timestampField =
      event.payload.type === 'task_started' ? 'startedAtUtc' : 'endedAtUtc';
    const normalizedTimestamp = new Date(eventTime).toISOString();
    if (
      timing[timestampField] &&
      timing[timestampField] !== normalizedTimestamp
    )
      throw new Error(`Conflicting timing events for ${turnId}.`);
    timing[timestampField] = normalizedTimestamp;
    timingsByTurnId.set(turnId, timing);
  }
  return [...timingsByTurnId.values()].map(timing => {
    if (!timing.startedAtUtc)
      throw new Error(`Completion has no start for ${timing.turnId}.`);
    const wallSeconds = timing.endedAtUtc
      ? (Date.parse(timing.endedAtUtc) - Date.parse(timing.startedAtUtc)) / 1000
      : null;
    if (wallSeconds !== null && wallSeconds < 0)
      throw new Error(`Completion precedes start for ${timing.turnId}.`);
    return {...timing, endedAtUtc: timing.endedAtUtc ?? null, wallSeconds};
  });
}

export function validateMeasurementRows(rows) {
  const errors = [];
  const warnings = [];
  const seenSteps = new Set();
  let previousStepNumber = 0;
  const historicalMissingCompletionSteps = new Set([
    'S14',
    'S15',
    'S30',
    'S33',
  ]);
  if (!rows.length)
    errors.push('Measurement log must contain at least one row.');
  for (const [rowIndex, row] of rows.entries()) {
    const hasCanonicalStep = /^S(?:0[1-9]|[1-9]\d+)$/.test(row.step ?? '');
    const stepNumber = Number(row.step?.slice(1));
    if (!hasCanonicalStep || seenSteps.has(row.step))
      errors.push(
        `${row.step}: step must be unique and canonical (S01–S09, S10 onward).`,
      );
    if (hasCanonicalStep && stepNumber <= previousStepNumber)
      errors.push(
        `${row.step}: steps must follow chronological increasing order.`,
      );
    if (hasCanonicalStep) previousStepNumber = stepNumber;
    seenSteps.add(row.step);
    const historicalIdentity = historicalIdentityByStep.get(row.step);
    const isHistoricalRow = Boolean(
      historicalIdentity &&
      historicalIdentity.turnId === row.turn_id &&
      historicalIdentity.startedAtUtc === row.started_at_utc,
    );
    if (historicalIdentity && !isHistoricalRow)
      errors.push(
        `${row.step}: historical identity does not match the frozen baseline.`,
      );
    for (const field of [
      'task',
      'turn_id',
      'skills_applied',
      'skill_evidence',
    ]) {
      if (!row[field]?.trim() || /^(unknown|not audited)$/i.test(row[field]))
        errors.push(`${row.step}: ${field} is required.`);
    }
    if (!/^\d+$/.test(row.technical_retry_count ?? '')) {
      const message = `${row.step}: technical_retry_count requires an audited nonnegative integer.`;
      (isHistoricalRow ? warnings : errors).push(message);
    }
    const startedAt = Date.parse(row.started_at_utc);
    const endedAt = Date.parse(row.ended_at_utc);
    if (!isValidUtcTimestamp(row.started_at_utc))
      errors.push(
        `${row.step}: started_at_utc must be a recorded UTC start timestamp.`,
      );
    if (row.status === 'in progress') {
      if (rowIndex !== rows.length - 1)
        errors.push(`${row.step}: only the final row may be in progress.`);
      if (
        row.ended_at_utc !== 'unknown' ||
        row.assistant_turn_wall_seconds !== 'unknown'
      )
        errors.push(`${row.step}: in progress must not claim completion.`);
      continue;
    }
    if (!isValidUtcTimestamp(row.ended_at_utc)) {
      const message = `${row.step}: ended_at_utc must be a recorded UTC completion timestamp.`;
      (isHistoricalRow && historicalMissingCompletionSteps.has(row.step)
        ? warnings
        : errors
      ).push(message);
      continue;
    }
    if (Number.isFinite(startedAt) && Number.isFinite(endedAt)) {
      if (endedAt < startedAt)
        errors.push(`${row.step}: completion precedes start.`);
      const durationSeconds = Number(row.assistant_turn_wall_seconds);
      if (
        !row.assistant_turn_wall_seconds ||
        !Number.isFinite(durationSeconds) ||
        Math.abs(durationSeconds - (endedAt - startedAt) / 1000) > 0.001
      ) {
        errors.push(
          `${row.step}: duration must match the recorded timestamps.`,
        );
      }
    }
  }
  return {errors, warnings};
}

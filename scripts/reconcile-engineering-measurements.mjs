import { createReadStream, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { extractTurnTimings } from './engineering-measurements.mjs';
import { parseMeasurementCsv, serializeMeasurementCsv } from './measurement-csv.mjs';

const commandArguments = process.argv.slice(2);
const eventPath = commandArguments[commandArguments.indexOf('--events') + 1];
const logPath = fileURLToPath(
  new URL('../docs/engineering/sessions/2026-10-01-aeki-turn-timings.csv', import.meta.url),
);
try {
  if (!commandArguments.includes('--events') || !eventPath || eventPath.startsWith('--'))
    throw new Error('Provide --events followed by the local Codex JSONL path.');
  const timingEvents = [];
  const eventLines = createInterface({ input: createReadStream(eventPath), crlfDelay: Infinity });
  for await (const line of eventLines) {
    if (!line.trim()) continue;
    const event = JSON.parse(line);
    if (
      event.type === 'event_msg' &&
      ['task_started', 'task_complete'].includes(event.payload?.type)
    ) {
      // Retain timing metadata only; prompts, outputs and credentials never enter the repository.
      timingEvents.push({
        timestamp: event.timestamp,
        type: event.type,
        payload: { type: event.payload.type, turn_id: event.payload.turn_id },
      });
    }
  }
  const timings = extractTurnTimings(timingEvents);
  const rows = parseMeasurementCsv(readFileSync(logPath, 'utf8'));
  let updatedRows = 0;
  for (const row of rows) {
    const checkpointTime = Date.parse(row.delivery_checkpoint_utc);
    const candidates =
      row.turn_id !== 'unknown'
        ? timings.filter((timing) => timing.turnId === row.turn_id)
        : timings.filter(
            (timing) =>
              Date.parse(timing.startedAtUtc) <= checkpointTime &&
              timing.endedAtUtc &&
              Date.parse(timing.endedAtUtc) >= checkpointTime,
          );
    if (candidates.length > 1)
      throw new Error(`Ambiguous turn match for ${row.step}; resolve manually.`);
    const timing = candidates[0];
    if (!timing) continue;
    const updated = {
      ...row,
      turn_id: timing.turnId,
      started_at_utc: timing.startedAtUtc,
      ended_at_utc: timing.endedAtUtc ?? 'unknown',
      assistant_turn_wall_seconds:
        timing.wallSeconds === null ? 'unknown' : timing.wallSeconds.toFixed(3),
    };
    if (timing.endedAtUtc && row.status === 'in progress')
      updated.status = 'completed assistant turn; outcome recorded in session evidence';
    if (JSON.stringify(row) !== JSON.stringify(updated)) {
      Object.assign(row, updated);
      updatedRows += 1;
      console.log(`${row.step}: ${timing.turnId}; ${row.assistant_turn_wall_seconds} seconds`);
    }
  }
  if (commandArguments.includes('--write')) writeFileSync(logPath, serializeMeasurementCsv(rows));
  console.log(
    `${commandArguments.includes('--write') ? 'Reconciled' : 'Dry run:'} ${updatedRows} timing rows. Retry audits and business outcomes are not inferred from timing events.`,
  );
} catch (error) {
  console.error(`Measurement reconciliation failed: ${error.message}`);
  process.exitCode = 1;
}

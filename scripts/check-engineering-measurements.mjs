import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateMeasurementRows } from './engineering-measurements.mjs';
import { parseMeasurementCsv } from './measurement-csv.mjs';

const defaultLogPath = fileURLToPath(
  new URL('../docs/engineering/sessions/2026-10-01-aeki-turn-timings.csv', import.meta.url),
);
try {
  const rows = parseMeasurementCsv(readFileSync(process.argv[2] ?? defaultLogPath, 'utf8'));
  const validation = validateMeasurementRows(rows);
  for (const warning of validation.warnings)
    console.warn(`Historical evidence warning: ${warning}`);
  for (const error of validation.errors) console.error(error);
  if (validation.errors.length) process.exitCode = 1;
  else
    console.log(
      `Measurement log valid: ${rows.length} rows; ${validation.warnings.length} historical warnings.`,
    );
} catch (error) {
  console.error(`Measurement check failed: ${error.message}`);
  process.exitCode = 1;
}

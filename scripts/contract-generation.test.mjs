import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('contract CLI produces reproducible formatted output and rejects drift or missing files', () => {
  const outputDirectory = mkdtempSync(join(tmpdir(), 'aeki-generated-contracts-'));
  const run = (argumentsList) =>
    spawnSync(process.execPath, ['scripts/generate-contracts.mjs', ...argumentsList], {
      encoding: 'utf8',
    });
  assert.equal(run(['--output', outputDirectory]).status, 0);
  const generatedSchema = readFileSync(join(outputDirectory, 'health-schema.ts'), 'utf8');
  assert.match(generatedSchema, /healthSchema/);
  assert.equal(run(['--output', outputDirectory, '--check']).status, 0);
  writeFileSync(join(outputDirectory, 'health-schema.ts'), '// stale output\n');
  assert.match(
    run(['--output', outputDirectory, '--check']).stderr,
    /Contract drift: health-schema\.ts/,
  );
  unlinkSync(join(outputDirectory, 'health-schema.ts'));
  assert.match(
    run(['--output', outputDirectory, '--check']).stderr,
    /Missing generated contract: health-schema\.ts/,
  );
  const defaultCheck = run(['--check']);
  assert.equal(defaultCheck.status, 0, defaultCheck.stderr);
});

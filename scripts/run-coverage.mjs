import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export function runCoverageTests(npmCliPath, runProcess = spawnSync) {
  if (!npmCliPath)
    throw new Error('Run coverage through npm run test:coverage.');
  const result = runProcess(process.execPath, [npmCliPath, 'test'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    stdio: 'inherit',
    env: {...process.env, AEKI_COVERAGE: '1'},
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  process.exitCode = runCoverageTests(process.env.npm_execpath);
}

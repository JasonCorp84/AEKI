import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Capture the candidate without modifying the real index or creating a commit.
const repositoryArgumentIndex = process.argv.indexOf('--repository');
const repositoryDirectory =
  repositoryArgumentIndex === -1
    ? fileURLToPath(new URL('../', import.meta.url))
    : process.argv[repositoryArgumentIndex + 1];
const npmCliPath = process.env.npm_execpath;
if (!npmCliPath) throw new Error('Run this script through npm run verify:clean.');
const verificationDirectory = mkdtempSync(join(tmpdir(), 'aeki-clean-'));
const candidateCheckoutDirectory = join(verificationDirectory, 'checkout');
mkdirSync(candidateCheckoutDirectory);
const candidateGitEnvironment = {
  ...process.env,
  GIT_INDEX_FILE: join(verificationDirectory, 'candidate-index'),
};
const runCandidateGitCommand = (commandArguments) =>
  execFileSync('git', commandArguments, {
    cwd: repositoryDirectory,
    env: candidateGitEnvironment,
    encoding: 'utf8',
  }).trim();
runCandidateGitCommand(['read-tree', 'HEAD']);
runCandidateGitCommand(['add', '--all', '--', '.']);
const candidateTreeHash = runCandidateGitCommand(['write-tree']);
const candidateArchivePath = join(verificationDirectory, 'candidate.tar');
runCandidateGitCommand([
  'archive',
  '--format=tar',
  `--output=${candidateArchivePath}`,
  candidateTreeHash,
]);
execFileSync('tar', ['-xf', candidateArchivePath, '-C', candidateCheckoutDirectory]);
for (const commandArguments of [['ci'], ['run', 'check']]) {
  const commandResult = spawnSync(process.execPath, [npmCliPath, ...commandArguments], {
    cwd: candidateCheckoutDirectory,
    stdio: 'inherit',
    env: process.env,
  });
  if (commandResult.status !== 0)
    throw new Error(`Clean verification failed: npm ${commandArguments.join(' ')}`);
}
console.log(`Clean candidate tree verified: ${candidateTreeHash}`);
console.log(`Independent checkout retained for inspection: ${candidateCheckoutDirectory}`);

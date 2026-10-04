import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) throw new Error('Run API tests through the isolated PostgreSQL test runner.');
const repositoryDirectory = fileURLToPath(new URL('../../../', import.meta.url));
const testProjectName = process.env.TEST_COMPOSE_PROJECT;
if (!testProjectName || !/^aeki-test-\d+-\d+$/.test(testProjectName))
  throw new Error('Missing owned test Compose project.');

export function runTestDatabaseCommand(command) {
  const commandArguments =
    command === 'start'
      ? ['up', '--detach', '--wait', '--wait-timeout', '90', 'postgres']
      : [command, 'postgres'];
  execFileSync(
    'docker',
    ['compose', '-f', 'compose.test.yaml', '-p', testProjectName, ...commandArguments],
    {
      cwd: repositoryDirectory,
      stdio: 'ignore',
    },
  );
}

export function resumeTestDatabase() {
  try {
    runTestDatabaseCommand('unpause');
  } catch {
    /* Already unpaused. */
  }
}

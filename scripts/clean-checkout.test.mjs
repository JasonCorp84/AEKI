import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const npmCliPath =
  process.env.npm_execpath ?? require.resolve('npm/bin/npm-cli.js');

test('clean checkout verifies the working candidate without staging changes and reports failed checks', () => {
  const repositoryDirectory = mkdtempSync(
    join(tmpdir(), 'aeki-clean-fixture-'),
  );
  const git = args =>
    spawnSync('git', args, {cwd: repositoryDirectory, encoding: 'utf8'});
  git(['init', '--initial-branch=main']);
  git(['config', 'user.name', 'Pipeline Test']);
  git(['config', 'user.email', 'pipeline-test@example.invalid']);
  writeFileSync(
    join(repositoryDirectory, 'package.json'),
    JSON.stringify({
      name: 'clean-fixture',
      version: '1.0.0',
      scripts: {check: 'node --check example.js'},
    }),
  );
  writeFileSync(
    join(repositoryDirectory, 'package-lock.json'),
    JSON.stringify({
      name: 'clean-fixture',
      version: '1.0.0',
      lockfileVersion: 3,
      packages: {'': {name: 'clean-fixture', version: '1.0.0'}},
    }),
  );
  writeFileSync(join(repositoryDirectory, 'example.js'), 'const answer = 42;');
  git(['add', '.']);
  git(['commit', '-m', 'Create clean fixture']);
  const run = environment =>
    spawnSync(
      process.execPath,
      [
        resolve('scripts/verify-clean.mjs'),
        '--repository',
        repositoryDirectory,
      ],
      {encoding: 'utf8', env: environment},
    );
  const passed = run({...process.env, npm_execpath: npmCliPath});
  assert.equal(passed.status, 0, passed.stdout + passed.stderr);
  assert.match(passed.stdout, /Clean candidate tree verified/);
  writeFileSync(join(repositoryDirectory, 'example.js'), 'const = ;');
  const originalIndex = git(['write-tree']).stdout;
  const failed = run({...process.env, npm_execpath: npmCliPath});
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /Clean verification failed: npm run check/);
  assert.equal(git(['write-tree']).stdout, originalIndex);
  const missingEnvironment = {...process.env};
  delete missingEnvironment.npm_execpath;
  assert.match(run(missingEnvironment).stderr, /Run this script through npm/);
  const defaultRepository = spawnSync(
    process.execPath,
    [resolve('scripts/verify-clean.mjs')],
    {
      encoding: 'utf8',
      env: missingEnvironment,
    },
  );
  assert.match(defaultRepository.stderr, /Run this script through npm/);
});

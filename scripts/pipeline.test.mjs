import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {checkCoverage} from './check-coverage.mjs';
import {runCoverageTests} from './run-coverage.mjs';

const coverageCommand = resolve('scripts/check-coverage.mjs');

test('coverage runner propagates failed tests, process signals and launch failures', () => {
  assert.equal(
    runCoverageTests('npm.js', () => ({status: 0})),
    0,
  );
  assert.equal(
    runCoverageTests('npm.js', () => ({status: 2})),
    2,
  );
  assert.equal(
    runCoverageTests('npm.js', () => ({status: null})),
    1,
  );
  assert.throws(() => runCoverageTests(undefined), /Run coverage through npm/);
  assert.throws(
    () =>
      runCoverageTests('npm.js', () => ({
        error: new Error('Process launch refused'),
      })),
    /Process launch refused/,
  );
  for (const modulePath of [
    './scripts/run-coverage.mjs',
    './scripts/check-coverage.mjs',
    './scripts/run-api-tests.mjs',
    './scripts/run-browser-tests.mjs',
  ]) {
    const imported = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', `await import('${modulePath}');`],
      {encoding: 'utf8'},
    );
    assert.equal(imported.status, 0, imported.stderr);
  }
});

function createCoverageFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'aeki-coverage-gate-'));
  mkdirSync(join(directory, 'apps/web/src'), {recursive: true});
  const sourcePath = join(directory, 'apps/web/src/example.ts');
  writeFileSync(sourcePath, 'export function answer() { return 42; }\n');
  const reportPath = join(directory, 'coverage.json');
  return {directory, sourcePath, reportPath};
}

test('coverage command rejects an executable source file absent from the report', () => {
  const fixture = createCoverageFixture();
  writeFileSync(fixture.reportPath, '{}');
  const result = spawnSync(
    process.execPath,
    [
      coverageCommand,
      '--root',
      fixture.directory,
      '--report',
      fixture.reportPath,
    ],
    {encoding: 'utf8'},
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing coverage.*example\.ts/);
});

function writeCoverageReport(fixture, executionCount) {
  const location = {start: {line: 1, column: 0}, end: {line: 1, column: 42}};
  writeFileSync(
    fixture.reportPath,
    JSON.stringify({
      [fixture.sourcePath]: {
        path: fixture.sourcePath,
        statementMap: {0: location},
        s: {0: executionCount},
        fnMap: {0: {name: 'answer', decl: location, loc: location, line: 1}},
        f: {0: executionCount},
        branchMap: {
          0: {type: 'if', loc: location, locations: [location, location]},
        },
        b: {0: [executionCount, executionCount]},
      },
    }),
  );
}

test('coverage command rejects empty instrumentation for executable source', () => {
  const fixture = createCoverageFixture();
  writeFileSync(
    fixture.reportPath,
    JSON.stringify({
      [fixture.sourcePath]: {
        path: fixture.sourcePath,
        statementMap: {},
        s: {},
        fnMap: {},
        f: {},
        branchMap: {},
        b: {},
      },
    }),
  );
  const result = spawnSync(
    process.execPath,
    [
      coverageCommand,
      '--root',
      fixture.directory,
      '--report',
      fixture.reportPath,
    ],
    {encoding: 'utf8'},
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing statement instrumentation.*example\.ts/);
});

test('coverage command accepts measured statements without functions or branches', () => {
  const fixture = createCoverageFixture();
  writeFileSync(fixture.sourcePath, 'export const answer = 42;\n');
  writeCoverageReport(fixture, 1);
  const report = JSON.parse(readFileSync(fixture.reportPath, 'utf8'));
  const fileCoverage = report[fixture.sourcePath];
  fileCoverage.fnMap = {};
  fileCoverage.f = {};
  fileCoverage.branchMap = {};
  fileCoverage.b = {};
  writeFileSync(fixture.reportPath, JSON.stringify(report));
  const result = spawnSync(
    process.execPath,
    [
      coverageCommand,
      '--root',
      fixture.directory,
      '--report',
      fixture.reportPath,
    ],
    {encoding: 'utf8'},
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /All four coverage metrics are 100%/);
});

test('coverage gate rejects every uncovered metric and accepts complete execution', () => {
  const fixture = createCoverageFixture();
  writeCoverageReport(fixture, 0);
  const result = checkCoverage(fixture.directory, [fixture.reportPath]);
  assert.equal(result.errors.length, 4);
  for (const metric of ['lines', 'statements', 'functions', 'branches'])
    assert.ok(result.errors.some(error => error.includes(metric)));
  writeCoverageReport(fixture, 1);
  assert.deepEqual(
    checkCoverage(fixture.directory, [fixture.reportPath]).errors,
    [],
  );
  const commandResult = spawnSync(
    process.execPath,
    [
      coverageCommand,
      '--root',
      fixture.directory,
      '--report',
      fixture.reportPath,
    ],
    {encoding: 'utf8'},
  );
  assert.equal(commandResult.status, 0);
  assert.match(commandResult.stdout, /All four coverage metrics are 100%/);
  for (const suite of ['contracts', 'web', 'api', 'processes']) {
    mkdirSync(join(fixture.directory, 'coverage', suite), {recursive: true});
    writeFileSync(
      join(fixture.directory, 'coverage', suite, 'coverage-final.json'),
      readFileSync(fixture.reportPath),
    );
  }
  const defaultReports = spawnSync(
    process.execPath,
    [coverageCommand, '--root', fixture.directory],
    {encoding: 'utf8'},
  );
  assert.equal(defaultReports.status, 0, defaultReports.stderr);
  const defaultRoot = spawnSync(
    process.execPath,
    [coverageCommand, '--report', fixture.reportPath],
    {encoding: 'utf8'},
  );
  assert.equal(defaultRoot.status, 1);
  assert.match(defaultRoot.stderr, /Missing coverage/);
});

test('real Git hooks preserve unstaged edits while formatting commits and block an unformatted push', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aeki-git-hooks-'));
  const remoteDirectory = mkdtempSync(join(tmpdir(), 'aeki-git-remote-'));
  const hookEnvironment = {...process.env, HUSKY: '1'};
  const git = args =>
    spawnSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
      env: hookEnvironment,
    });
  assert.equal(git(['init', '--initial-branch=main']).status, 0);
  assert.equal(spawnSync('git', ['init', '--bare', remoteDirectory]).status, 0);
  git(['config', 'user.name', 'Pipeline Test']);
  git(['config', 'user.email', 'pipeline-test@example.invalid']);
  git(['remote', 'add', 'origin', remoteDirectory]);
  symlinkSync(
    resolve('node_modules'),
    join(directory, 'node_modules'),
    'junction',
  );
  writeFileSync(join(directory, '.gitignore'), 'node_modules/\n');
  writeFileSync(
    join(directory, 'package.json'),
    JSON.stringify({
      private: true,
      scripts: {'format:check': 'prettier --check .'},
    }),
  );
  writeFileSync(
    join(directory, '.lintstagedrc.json'),
    readFileSync('.lintstagedrc.json'),
  );
  for (const configuration of ['eslint.config.mjs', '.prettierrc.json'])
    writeFileSync(join(directory, configuration), readFileSync(configuration));
  mkdirSync(join(directory, '.husky'));
  for (const hook of ['pre-commit', 'pre-push'])
    writeFileSync(
      join(directory, '.husky', hook),
      readFileSync(join('.husky', hook)),
    );
  const installedHusky = spawnSync(
    process.execPath,
    [resolve('node_modules/husky/bin.js')],
    {
      cwd: directory,
      encoding: 'utf8',
      env: hookEnvironment,
    },
  );
  assert.equal(installedHusky.status, 0);
  writeFileSync(join(directory, 'example.js'), 'export const answer=42;\n');
  git(['add', '.']);
  writeFileSync(
    join(directory, 'example.js'),
    'export const answer=42;\nconst unstaged=1;\n',
  );
  const committed = git(['commit', '-m', 'Exercise native formatter hook']);
  assert.equal(committed.status, 0, committed.stdout + committed.stderr);
  assert.equal(
    git(['show', 'HEAD:example.js']).stdout.trim(),
    'export const answer = 42;',
  );
  assert.match(readFileSync(join(directory, 'example.js'), 'utf8'), /unstaged/);
  const blockedPush = git(['push', 'origin', 'main']);
  assert.notEqual(blockedPush.status, 0);
  assert.match(blockedPush.stdout + blockedPush.stderr, /Code style issues/);
  assert.notEqual(
    spawnSync('git', [
      '--git-dir',
      remoteDirectory,
      'rev-parse',
      'refs/heads/main',
    ]).status,
    0,
  );
});

test('coverage gate fails closed for empty inventories, unreadable reports and malformed reports', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aeki-empty-coverage-'));
  const reportPath = join(directory, 'coverage.json');
  writeFileSync(reportPath, '{}');
  assert.match(
    checkCoverage(directory, [reportPath]).errors[0],
    /No source files/,
  );
  for (const report of [join(directory, 'absent.json'), reportPath]) {
    if (report === reportPath) writeFileSync(report, 'invalid JSON');
    const result = spawnSync(
      process.execPath,
      [coverageCommand, '--root', directory, '--report', report],
      {encoding: 'utf8'},
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Coverage check failed/);
  }
});

test('coverage inventory excludes type-only declarations, test fixtures and generated output', () => {
  const fixture = createCoverageFixture();
  writeCoverageReport(fixture, 1);
  writeFileSync(
    join(fixture.directory, 'apps/web/src/types.ts'),
    'export interface Settings { title: string }',
  );
  writeFileSync(
    join(fixture.directory, 'apps/web/src/example.test.ts'),
    'throw new Error("test fixture");',
  );
  mkdirSync(join(fixture.directory, 'apps/web/src/generated'));
  writeFileSync(
    join(fixture.directory, 'apps/web/src/generated/schema.ts'),
    'export const schema = {};',
  );
  assert.deepEqual(
    checkCoverage(fixture.directory, [fixture.reportPath]).errors,
    [],
  );
});

test('a newly added JavaScript application file cannot bypass the source inventory', () => {
  const fixture = createCoverageFixture();
  writeCoverageReport(fixture, 1);
  writeFileSync(
    join(fixture.directory, 'apps/web/src/additional.mjs'),
    'export const answer = 42;',
  );
  assert.ok(
    checkCoverage(fixture.directory, [fixture.reportPath]).errors.some(error =>
      /Missing coverage.*additional\.mjs/.test(error),
    ),
  );
});

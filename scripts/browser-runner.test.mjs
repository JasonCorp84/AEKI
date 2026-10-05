import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawn} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {EventEmitter} from 'node:events';
import {runBrowserTests} from './run-browser-tests.mjs';

test('browser command preserves a failed child result, safe diagnostics and owned cleanup', async () => {
  const artifactDirectory = mkdtempSync(join(tmpdir(), 'aeki-browser-runner-'));
  writeFileSync(
    join(artifactDirectory, 'browser.log'),
    'stale evidence from an earlier run',
  );
  const commands = [];
  const exitCode = await runBrowserTests([], {
    artifactDirectory,
    runCommand: (_command, arguments_) => {
      commands.push(arguments_);
      return '';
    },
    applyMigrations: async () => {},
    startProcess: () =>
      spawn(process.execPath, [
        '-e',
        'console.error("postgresql://user:secret@localhost/database aeki_test_only");process.exitCode=7',
      ]),
  });
  assert.equal(exitCode, 7);
  assert.match(
    readFileSync(join(artifactDirectory, 'browser.log'), 'utf8'),
    /\[redacted\]/,
  );
  assert.doesNotMatch(
    readFileSync(join(artifactDirectory, 'browser.log'), 'utf8'),
    /secret|aeki_test_only|stale evidence/,
  );
  const cleanup = commands.at(-1);
  assert.deepEqual(cleanup.slice(-3), [
    'down',
    '--volumes',
    '--remove-orphans',
  ]);
  assert.match(cleanup[4], /^aeki-test-\d+-\d+$/);
});

test('failed startup still removes its owned project when database logs are unavailable', async () => {
  const artifactDirectory = mkdtempSync(
    join(tmpdir(), 'aeki-browser-startup-'),
  );
  let removedProject;
  const exitCode = await runBrowserTests([], {
    artifactDirectory,
    runCommand: (_command, arguments_) => {
      if (arguments_.includes('down')) {
        removedProject = arguments_[4];
        return '';
      }
      throw new Error(
        'daemon unavailable: postgresql://user:secret@localhost/db',
      );
    },
  });
  assert.equal(exitCode, 1);
  assert.match(removedProject, /^aeki-test-\d+-\d+$/);
  assert.doesNotMatch(
    readFileSync(join(artifactDirectory, 'runner.log'), 'utf8'),
    /secret/,
  );
});

test('interruption stops the real child before removing the owned database and returns failure', async () => {
  const signals = new EventEmitter();
  let child;
  let wasChildStoppedAtCleanup = false;
  const exitCode = await runBrowserTests([], {
    artifactDirectory: mkdtempSync(join(tmpdir(), 'aeki-browser-interrupt-')),
    signals,
    runCommand: (_command, arguments_) => {
      if (arguments_.includes('down'))
        wasChildStoppedAtCleanup =
          child.exitCode !== null || child.signalCode !== null;
      return '';
    },
    applyMigrations: async () => {},
    startProcess: () => {
      child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)']);
      child.once('spawn', () => signals.emit('SIGTERM'));
      return child;
    },
  });
  assert.equal(exitCode, 1);
  assert.equal(wasChildStoppedAtCleanup, true);
  assert.equal(signals.listenerCount('SIGTERM'), 0);
});

test('a browser deadline stops a real hung child and a cleanup failure cannot produce success', async () => {
  const artifactDirectory = mkdtempSync(
    join(tmpdir(), 'aeki-browser-deadline-'),
  );
  let child;
  const exitCode = await runBrowserTests([], {
    artifactDirectory,
    browserTimeoutMilliseconds: 100,
    runCommand: (_command, arguments_) => {
      if (arguments_.includes('down')) throw new Error('cleanup denied');
      return '';
    },
    applyMigrations: async () => {},
    startProcess: () => {
      child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)']);
      return child;
    },
  });
  assert.equal(exitCode, 1);
  assert.ok(child.exitCode !== null || child.signalCode !== null);
  assert.match(
    readFileSync(join(artifactDirectory, 'runner.log'), 'utf8'),
    /cleanup failed/,
  );
});

test('a child launch error remains a diagnosed failure and triggers owned cleanup', async () => {
  const artifactDirectory = mkdtempSync(join(tmpdir(), 'aeki-browser-launch-'));
  let hasCleanedUp = false;
  const exitCode = await runBrowserTests([], {
    artifactDirectory,
    runCommand: (_command, arguments_) => {
      hasCleanedUp ||= arguments_.includes('down');
      return '';
    },
    applyMigrations: async () => {},
    startProcess: () =>
      spawn(join(artifactDirectory, 'missing-executable'), []),
  });
  assert.equal(exitCode, 1);
  assert.equal(hasCleanedUp, true);
  assert.match(
    readFileSync(join(artifactDirectory, 'browser.log'), 'utf8'),
    /could not start/,
  );
});

test('an interruption during setup does not launch the browser and still cleans its database', async () => {
  const signals = new EventEmitter();
  let hasCleanedUp = false;
  const exitCode = await runBrowserTests([], {
    artifactDirectory: mkdtempSync(
      join(tmpdir(), 'aeki-browser-setup-interrupt-'),
    ),
    signals,
    runCommand: (_command, arguments_) => {
      hasCleanedUp ||= arguments_.includes('down');
      return '';
    },
    applyMigrations: async () => {
      signals.emit('SIGINT');
    },
    startProcess: () =>
      assert.fail('Interrupted setup must not launch a browser.'),
  });
  assert.equal(exitCode, 1);
  assert.equal(hasCleanedUp, true);
  assert.equal(signals.listenerCount('SIGINT'), 0);
});

test('an externally terminated browser child cannot be reported as success', async () => {
  const exitCode = await runBrowserTests([], {
    artifactDirectory: mkdtempSync(
      join(tmpdir(), 'aeki-browser-child-signal-'),
    ),
    runCommand: () => '',
    applyMigrations: async () => {},
    startProcess: () => {
      const child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)']);
      child.once('spawn', () => child.kill('SIGTERM'));
      return child;
    },
  });
  assert.equal(exitCode, 1);
});

test('lost artifact storage cannot prevent owned database cleanup', async () => {
  const artifactDirectory = mkdtempSync(
    join(tmpdir(), 'aeki-browser-lost-artifacts-'),
  );
  assert.ok(artifactDirectory.startsWith(tmpdir()));
  let hasCleanedUp = false;
  await assert.rejects(
    runBrowserTests([], {
      artifactDirectory,
      runCommand: (_command, arguments_) => {
        hasCleanedUp ||= arguments_.includes('down');
        return '';
      },
      applyMigrations: async () => {
        rmSync(artifactDirectory, {recursive: true});
        throw new Error('Interrupted artifact storage');
      },
    }),
    /ENOENT/,
  );
  assert.equal(hasCleanedUp, true);
});

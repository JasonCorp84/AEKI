import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import coverageLibrary from 'istanbul-lib-coverage';
import ts from 'typescript';

export function checkCoverage(repositoryDirectory, reportPaths) {
  const coverage = coverageLibrary.createCoverageMap({});
  for (const reportPath of reportPaths) {
    coverage.merge(JSON.parse(readFileSync(reportPath, 'utf8')));
  }
  const errors = [];
  const candidates = globSync(
    [
      'apps/*/src/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'packages/*/src/**/*.{ts,tsx,js,jsx,mjs,cjs}',
      'scripts/**/*.{mjs,js,cjs,ts,tsx}',
    ],
    { cwd: repositoryDirectory },
  ).filter((path) => !/[/\\](?:generated|test)[/\\]|\.test\.[^/\\]+$|\.d\.ts$/.test(path));
  const sourceFiles = [];
  for (const sourceFile of candidates) {
    const absolutePath = resolve(repositoryDirectory, sourceFile);
    if (/\.tsx?$/.test(sourceFile)) {
      const emittedCode = ts.transpileModule(readFileSync(absolutePath, 'utf8'), {
        compilerOptions: {
          removeComments: true,
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ESNext,
          module: ts.ModuleKind.ESNext,
        },
      }).outputText;
      if (!emittedCode.replace(/export\s*\{\s*\};?/g, '').trim()) continue;
    }
    sourceFiles.push(sourceFile);
    if (!coverage.files().includes(absolutePath)) {
      errors.push(`Missing coverage: ${sourceFile}`);
      continue;
    }
    const summary = coverage.fileCoverageFor(absolutePath).toSummary();
    if (summary.statements.total === 0) {
      errors.push(`Missing statement instrumentation: ${sourceFile}`);
    }
    for (const metric of ['lines', 'statements', 'functions', 'branches']) {
      if (summary[metric].covered !== summary[metric].total) {
        errors.push(
          `${sourceFile}: ${metric} ${summary[metric].covered}/${summary[metric].total}; required 100%.`,
        );
      }
    }
  }
  if (!sourceFiles.length) errors.push('No source files found; coverage cannot pass vacuously.');
  return { errors, coverage, sourceFiles };
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try {
    const argumentsList = process.argv.slice(2);
    const rootIndex = argumentsList.indexOf('--root');
    const repositoryDirectory =
      rootIndex === -1
        ? fileURLToPath(new URL('../', import.meta.url))
        : resolve(argumentsList[rootIndex + 1]);
    const explicitReports = argumentsList.flatMap((argument, index) =>
      argument === '--report' ? [argumentsList[index + 1]] : [],
    );
    const reportPaths = explicitReports.length
      ? explicitReports
      : ['contracts', 'web', 'api', 'processes'].map((suite) =>
          resolve(repositoryDirectory, 'coverage', suite, 'coverage-final.json'),
        );
    const result = checkCoverage(repositoryDirectory, reportPaths);
    for (const error of result.errors) console.error(error);
    if (result.errors.length) process.exitCode = 1;
    else
      console.log(
        `All four coverage metrics are 100% for ${result.sourceFiles.length} inventoried executable source files.`,
      );
  } catch (error) {
    console.error(`Coverage check failed: ${error.message}`);
    process.exitCode = 1;
  }
}

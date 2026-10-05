import {test, expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';

test('the built application reaches its actual API and database', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {name: 'API reachable', exact: true}),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {name: 'Database ready', exact: true}),
  ).toBeVisible();
  const databaseSection = page.getByRole('region', {
    name: 'Database connection',
  });
  const projectName = process.env.TEST_COMPOSE_PROJECT;
  if (!/^aeki-test-\d+-\d+$/.test(projectName))
    throw new Error('An owned isolated database is required.');
  const composeArguments = [
    'compose',
    '-f',
    'compose.test.yaml',
    '-p',
    projectName,
  ];
  execFileSync('docker', [...composeArguments, 'stop', 'postgres'], {
    timeout: 30000,
  });
  const outageResponse = page.waitForResponse(
    response => new URL(response.url()).pathname === '/api/readiness',
  );
  await databaseSection
    .getByRole('button', {name: 'Check database again'})
    .click();
  await expect(
    databaseSection.getByRole('heading', {
      name: 'Database not ready',
      exact: true,
    }),
  ).toBeVisible();
  expect((await outageResponse).status()).toBe(503);
  const livenessResponse = page.waitForResponse(
    response => new URL(response.url()).pathname === '/api/health',
  );
  await page.getByRole('button', {name: 'Check again', exact: true}).click();
  await expect(
    page.getByRole('heading', {name: 'API reachable', exact: true}),
  ).toBeVisible();
  expect(await (await livenessResponse).json()).toEqual({
    status: 'ok',
    service: 'aeki-api',
  });
  execFileSync(
    'docker',
    [...composeArguments, 'up', '--detach', '--wait', '--wait-timeout', '90'],
    {timeout: 120000},
  );
  const recoveryResponse = page.waitForResponse(
    response => new URL(response.url()).pathname === '/api/readiness',
  );
  await databaseSection
    .getByRole('button', {name: 'Retry database check'})
    .click();
  await expect(
    databaseSection.getByRole('heading', {name: 'Database ready', exact: true}),
  ).toBeVisible();
  expect((await recoveryResponse).status()).toBe(200);
});

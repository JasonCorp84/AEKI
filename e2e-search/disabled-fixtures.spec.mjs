import {test, expect} from '@playwright/test';

test('development needs explicit fixture opt-in and does not invent products when it is disabled', async ({
  page,
}) => {
  await page.route('**/api/products?**', route => route.abort('failed'));
  await page.goto('/search');
  const requestedProducts = page.waitForRequest(
    request => new URL(request.url()).pathname === '/api/products',
  );
  await page.getByRole('textbox', {name: 'Search products'}).fill('LINDEN');
  const request = await requestedProducts;
  expect(new URL(request.url()).searchParams.get('query')).toBe('LINDEN');
  await expect(page.getByRole('alert')).toContainText('Product search failed');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(
    page.getByText('Development fixtures', {exact: true}),
  ).toHaveCount(0);
  const workerRegistrations = await page.evaluate(async () =>
    (await navigator.serviceWorker.getRegistrations()).map(
      registration => registration.scope,
    ),
  );
  expect(workerRegistrations).toEqual([]);
});

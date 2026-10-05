import {test, expect} from '@playwright/test';

test('production never registers a mock worker even when the fixture flag is set', async ({
  page,
}) => {
  await page.goto('/search');
  await expect(
    page.getByRole('textbox', {name: 'Search products'}),
  ).toBeVisible();
  const workerRegistrations = await page.evaluate(async () =>
    (await navigator.serviceWorker.getRegistrations()).map(
      registration => registration.scope,
    ),
  );
  expect(workerRegistrations).toEqual([]);
  await expect(
    page.getByText('Development fixtures', {exact: true}),
  ).toHaveCount(0);
});

test('production issues real HTTP and reports failure without a fixture fallback', async ({
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
});

test('production renders contracted backend data rather than the development catalog', async ({
  page,
}) => {
  await page.route('**/api/products?**', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'backend-only-product',
            name: 'Backend-only chair',
            articleNumber: '00022222',
            description: 'Only supplied by this HTTP response.',
            image: {
              url: '/images/products/linden-chair.svg',
              alt: 'Backend chair',
            },
            price: {amountMinor: 500000, currency: 'HUF'},
            stock: {
              storeId: 'store-backend',
              storeName: 'Backend store',
              quantity: 2,
            },
          },
        ],
      }),
    }),
  );
  await page.goto('/search');
  await page
    .getByRole('textbox', {name: 'Search products'})
    .fill('Backend-only');
  await expect(
    page.getByRole('article', {name: 'Backend-only chair'}),
  ).toBeVisible();
  await expect(page.getByRole('article', {name: 'LINDEN chair'})).toHaveCount(
    0,
  );
});

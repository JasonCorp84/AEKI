import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.goto('/search');
  await expect(
    page.getByText('Development fixtures', {exact: true}),
  ).toBeVisible();
});

test('finds a product by name through the development HTTP fixture', async ({
  page,
}) => {
  await page.getByRole('textbox', {name: 'Search products'}).fill('LINDEN');
  const card = page.getByRole('article', {name: 'LINDEN chair'});
  await expect(card).toBeVisible();
  await expect(
    card.getByRole('img', {name: 'A wooden LINDEN dining chair'}),
  ).toBeVisible();
  await expect(card).toContainText('00012345');
  await expect(card).toContainText('A wooden dining chair.');
  await expect(card).toContainText('12,990');
  await expect(card).toContainText(/HUF|Ft/);
  await expect(card).toContainText('Budapest');
  await expect(card).toContainText('7 available');
  await expect(card).toContainText(/indicative/i);
  const imageLoads = await card
    .getByRole('img')
    .evaluate(image => image.complete && image.naturalWidth > 0);
  expect(imageLoads).toBe(true);
});

test('finds the same fixture by its leading-zero article number', async ({
  page,
}) => {
  await page.getByRole('textbox', {name: 'Search products'}).fill('00012345');
  await expect(page.getByRole('article', {name: 'LINDEN chair'})).toBeVisible();
});

test('fixture matching is case-insensitive and normalizes whitespace', async ({
  page,
}) => {
  await page
    .getByRole('textbox', {name: 'Search products'})
    .fill('  linden   chair  ');
  await expect(page.getByRole('article', {name: 'LINDEN chair'})).toBeVisible();
});

test('fixture results have deterministic ordering', async ({page}) => {
  const input = page.getByRole('textbox', {name: 'Search products'});
  await input.fill('0');
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('article').nth(0)).toHaveAccessibleName(
    'BJORK table',
  );
  await expect(page.getByRole('article').nth(1)).toHaveAccessibleName(
    'LINDEN chair',
  );
  await input.clear();
  await input.fill('0');
  await expect(page.getByRole('article').nth(0)).toHaveAccessibleName(
    'BJORK table',
  );
  await expect(page.getByRole('article').nth(1)).toHaveAccessibleName(
    'LINDEN chair',
  );
});

test('shows no matches without inventing a result', async ({page}) => {
  await page
    .getByRole('textbox', {name: 'Search products'})
    .fill('No such fixture product');
  await expect(
    page.getByText('No products found', {exact: true}),
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('clearing results and entering whitespace returns to waiting', async ({
  page,
}) => {
  const input = page.getByRole('textbox', {name: 'Search products'});
  await input.fill('LINDEN');
  await expect(page.getByRole('article', {name: 'LINDEN chair'})).toBeVisible();
  await input.fill('   ');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Search for a product');
});

test('keyboard users can reach search, see focus and read a result', async ({
  page,
}) => {
  const input = page.getByRole('textbox', {name: 'Search products'});
  for (let attempts = 0; attempts < 12; attempts++) {
    await page.keyboard.press('Tab');
    if (await input.evaluate(element => element === document.activeElement))
      break;
  }
  await expect(input).toBeFocused();
  const hasVisibleFocus = await input.evaluate(element => {
    const styles = getComputedStyle(element);
    return (
      styles.outlineStyle !== 'none' && parseFloat(styles.outlineWidth) > 0
    );
  });
  expect(hasVisibleFocus).toBe(true);
  await page.keyboard.type('LINDEN');
  await expect(page.getByRole('article', {name: 'LINDEN chair'})).toBeVisible();
});

test('desktop and narrow screens keep search and cards inside the viewport', async ({
  page,
}) => {
  await page.getByRole('textbox', {name: 'Search products'}).fill('LINDEN');
  const card = page.getByRole('article', {name: 'LINDEN chair'});
  await expect(card).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  const viewport = page.viewportSize();
  const searchBounds = await page
    .getByRole('textbox', {name: 'Search products'})
    .boundingBox();
  expect(searchBounds.y + searchBounds.height).toBeLessThanOrEqual(
    viewport.height,
  );
  const cardBounds = await card.boundingBox();
  expect(cardBounds.x).toBeGreaterThanOrEqual(0);
  expect(cardBounds.x + cardBounds.width).toBeLessThanOrEqual(viewport.width);
});

test('search sits beside the introduction on desktop and below it on mobile', async ({
  page,
}) => {
  const titleBounds = await page.getByRole('heading', {level: 1}).boundingBox();
  const inputBounds = await page
    .getByRole('textbox', {name: 'Search products'})
    .boundingBox();
  if (page.viewportSize().width >= 832) {
    expect(inputBounds.x).toBeGreaterThanOrEqual(
      titleBounds.x + titleBounds.width,
    );
    expect(inputBounds.y).toBeLessThan(titleBounds.y + titleBounds.height);
  } else {
    expect(inputBounds.y).toBeGreaterThan(titleBounds.y + titleBounds.height);
  }
});

test('card colors change through semantic tokens without losing search', async ({
  page,
}) => {
  await page.getByRole('textbox', {name: 'Search products'}).fill('LINDEN');
  const card = page.getByRole('article', {name: 'LINDEN chair'});
  await expect(card).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--color-surface', '#122233');
    document.documentElement.style.setProperty('--color-text', '#f1e2d3');
  });
  await expect(card).toHaveCSS('background-color', 'rgb(18, 34, 51)');
  await expect(card).toHaveCSS('color', 'rgb(241, 226, 211)');
  await expect(
    page.getByRole('textbox', {name: 'Search products'}),
  ).toHaveValue('LINDEN');
});

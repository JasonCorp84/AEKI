import {afterAll, afterEach, beforeAll, expect, it} from 'vitest';
import {setupServer} from 'msw/node';
import {parseProductSearchResponse, type Product} from '@aeki/contracts';
import {createProductSearchHandlers} from './products.handlers';

const fixtureServer = setupServer(...createProductSearchHandlers());
beforeAll(() => fixtureServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => fixtureServer.resetHandlers());
afterAll(() => fixtureServer.close());

async function searchFixtures(query: string) {
  const response = await fetch(`http://localhost/api/products${query}`);
  return parseProductSearchResponse(await response.json());
}

it('returns contract-valid name matches with explicit price and store stock', async () => {
  const response = await searchFixtures('?query=LiNdEn');
  expect(response.items.map(product => product.articleNumber)).toEqual([
    '00012345',
  ]);
  expect(response.items[0]?.price).toEqual({
    amountMinor: 1299000,
    currency: 'HUF',
  });
  expect(response.items[0]?.stock).toEqual({
    storeId: 'store-budapest',
    storeName: 'Budapest',
    quantity: 7,
  });
});

it('normalizes fixture query whitespace and supports article fragments', async () => {
  expect(
    (await searchFixtures('?query=%20linden%20%20chair%20')).items.map(
      product => product.id,
    ),
  ).toEqual(['product-linden-chair']);
  expect(
    (await searchFixtures('?query=98765')).items.map(product => product.id),
  ).toEqual(['product-bjork-table']);
});

it('orders broad matches by name regardless of source array order', async () => {
  expect(
    (await searchFixtures('?query=0')).items.map(product => product.id),
  ).toEqual(['product-bjork-table', 'product-linden-chair']);
});

it.each(['', '?query=', '?query=%20%20', '?query=missing'])(
  'does not invent fixture results for absent, blank or unmatched criteria: %s',
  async query => {
    expect(await searchFixtures(query)).toEqual({items: []});
  },
);

it('breaks equal-name fixture ties by stable product identity', async () => {
  const product: Product = {
    id: 'second',
    name: 'Equal chair',
    articleNumber: '00000001',
    description: 'A chair',
    image: {url: '/chair.svg', alt: 'Chair'},
    price: {amountMinor: 100, currency: 'HUF'},
    stock: {storeId: 'store', storeName: 'Store', quantity: 0},
  };
  fixtureServer.use(
    ...createProductSearchHandlers([product, {...product, id: 'first'}]),
  );
  expect(
    (await searchFixtures('?query=chair')).items.map(item => item.id),
  ).toEqual(['first', 'second']);
});

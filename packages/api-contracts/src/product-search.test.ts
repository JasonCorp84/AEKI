import {expect, it} from 'vitest';
import {
  parseProductSearchResponse,
  parseProductSearchErrorResponse,
} from './index.js';

const validProduct = {
  id: 'product-linden-chair',
  name: 'LINDEN chair',
  articleNumber: '00012345',
  description: 'A wooden dining chair.',
  image: {
    url: '/images/products/linden-chair.svg',
    alt: 'A wooden LINDEN dining chair',
  },
  price: {amountMinor: 1299000, currency: 'HUF'},
  stock: {storeId: 'store-budapest', storeName: 'Budapest', quantity: 7},
};

it('accepts a product search response with an article number, explicit price currency and store-specific stock', () => {
  const productSearchResponse = {
    items: [
      {
        id: 'product-linden-chair',
        name: 'LINDEN chair',
        articleNumber: '00012345',
        description: 'A wooden dining chair.',
        image: {
          url: '/images/products/linden-chair.svg',
          alt: 'A wooden LINDEN dining chair',
        },
        price: {amountMinor: 1299000, currency: 'HUF'},
        stock: {
          storeId: 'store-budapest',
          storeName: 'Budapest',
          quantity: 7,
        },
      },
    ],
  };

  expect(parseProductSearchResponse(productSearchResponse)).toEqual(
    productSearchResponse,
  );
});

it('accepts an empty search result without inventing products', () => {
  expect(parseProductSearchResponse({items: []})).toEqual({items: []});
});

it('preserves zero price and zero stock as valid values', () => {
  const response = {
    items: [
      {
        ...validProduct,
        price: {amountMinor: 0, currency: 'HUF'},
        stock: {...validProduct.stock, quantity: 0},
      },
    ],
  };
  expect(parseProductSearchResponse(response)).toEqual(response);
});

it.each([
  ['null response', null],
  ['missing collection', {}],
  ['non-array collection', {items: {}}],
  ['unknown response field', {items: [], unexpected: true}],
  ['missing product identity', {items: [{...validProduct, id: undefined}]}],
  ['empty product name', {items: [{...validProduct, name: ''}]}],
  [
    'numeric article number',
    {items: [{...validProduct, articleNumber: 12345}]},
  ],
  ['missing description', {items: [{...validProduct, description: undefined}]}],
  [
    'missing image alternative',
    {items: [{...validProduct, image: {url: '/chair.svg'}}]},
  ],
  [
    'negative price',
    {items: [{...validProduct, price: {amountMinor: -1, currency: 'HUF'}}]},
  ],
  [
    'fractional minor units',
    {items: [{...validProduct, price: {amountMinor: 1.5, currency: 'HUF'}}]},
  ],
  [
    'missing currency',
    {items: [{...validProduct, price: {amountMinor: 1299000}}]},
  ],
  [
    'missing stock store',
    {items: [{...validProduct, stock: {storeName: 'Budapest', quantity: 7}}]},
  ],
  [
    'missing stock store name',
    {
      items: [
        {...validProduct, stock: {storeId: 'store-budapest', quantity: 7}},
      ],
    },
  ],
  [
    'negative stock',
    {items: [{...validProduct, stock: {...validProduct.stock, quantity: -1}}]},
  ],
  [
    'fractional stock',
    {items: [{...validProduct, stock: {...validProduct.stock, quantity: 0.5}}]},
  ],
  ['unknown product field', {items: [{...validProduct, unexpected: true}]}],
])(
  'rejects %s at the untrusted response boundary',
  (_description, response) => {
    expect(() => parseProductSearchResponse(response)).toThrow(
      'Invalid product search response.',
    );
  },
);

it('accepts a stable recoverable search error code', () => {
  expect(
    parseProductSearchErrorResponse({code: 'PRODUCT_SEARCH_UNAVAILABLE'}),
  ).toEqual({code: 'PRODUCT_SEARCH_UNAVAILABLE'});
});

it.each([
  null,
  {},
  {code: 'UNKNOWN'},
  {code: 'PRODUCT_SEARCH_UNAVAILABLE', connectionString: 'secret'},
])('rejects an error outside the public search contract: %j', response => {
  expect(() => parseProductSearchErrorResponse(response)).toThrow(
    'Invalid product search error response.',
  );
});

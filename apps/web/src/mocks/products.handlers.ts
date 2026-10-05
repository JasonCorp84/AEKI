import {http, HttpResponse} from 'msw';
import type {Product} from '@aeki/contracts';

const fixtureProducts: Product[] = [
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
    stock: {storeId: 'store-budapest', storeName: 'Budapest', quantity: 7},
  },
  {
    id: 'product-bjork-table',
    name: 'BJORK table',
    articleNumber: '00098765',
    description: 'A wooden dining table.',
    image: {
      url: '/images/products/bjork-table.svg',
      alt: 'A wooden BJORK dining table',
    },
    price: {amountMinor: 2499000, currency: 'HUF'},
    stock: {storeId: 'store-budapest', storeName: 'Budapest', quantity: 3},
  },
];

export function createProductSearchHandlers(
  products: Product[] = fixtureProducts,
) {
  return [
    http.get('*/api/products', ({request}) => {
      const query = (new URL(request.url).searchParams.get('query') ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('en');
      const matches = query
        ? products.filter(
            product =>
              product.name.toLocaleLowerCase('en').includes(query) ||
              product.articleNumber.toLocaleLowerCase('en').includes(query),
          )
        : [];
      matches.sort(
        (first, second) =>
          first.name.localeCompare(second.name, 'en') ||
          first.id.localeCompare(second.id, 'en'),
      );
      return HttpResponse.json({items: matches});
    }),
  ];
}

export type SearchMessages = {
  locale: string;
  eyebrow: string;
  title: string;
  introduction: string;
  searchLabel: string;
  searchPlaceholder: string;
  waiting: string;
  loading: string;
  empty: string;
  failed: string;
  invalid: string;
  retry: string;
  articleLabel: string;
  stockDisclaimer: string;
  resultCount: (count: number) => string;
  availableStock: (quantity: number) => string;
};

export const englishSearchMessages: SearchMessages = {
  locale: 'en',
  eyebrow: 'Made for everyday living',
  title: 'Small changes. A home that feels like you.',
  introduction:
    'Find the next piece for your everyday spaces. Search by product name or article number.',
  searchLabel: 'Search products',
  searchPlaceholder: 'Try LINDEN or 00012345',
  waiting: 'Search for a product',
  loading: 'Searching products…',
  empty: 'No products found',
  failed: 'Product search failed',
  invalid: 'Invalid product response',
  retry: 'Retry search',
  articleLabel: 'Article number',
  stockDisclaimer: 'Indicative stock. Availability may change.',
  resultCount: count => `${count} results`,
  availableStock: quantity => `${quantity} available`,
};

import {afterAll, afterEach, beforeAll, expect, it, vi} from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Provider} from 'react-redux';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {createApplicationStore} from '../../../app/store';
import {baseApi} from '../../../app/api';
import {SearchPage} from './SearchPage';
import {englishSearchMessages} from '../model/search.messages';

const lindenChair = {
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
const bjorkTable = {
  ...lindenChair,
  id: 'product-bjork-table',
  name: 'BJORK table',
  articleNumber: '00098765',
  description: 'A wooden dining table.',
};
const searchServer = setupServer(
  http.get('*/api/products', () => HttpResponse.json({items: [lindenChair]})),
);
const renderedStores: ReturnType<typeof createApplicationStore>[] = [];

beforeAll(() => searchServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  cleanup();
  for (const store of renderedStores)
    store.dispatch(baseApi.util.resetApiState());
  renderedStores.length = 0;
  searchServer.resetHandlers();
  vi.useRealTimers();
});
afterAll(() => searchServer.close());

function renderSearchPage() {
  const store = createApplicationStore();
  renderedStores.push(store);
  render(
    <Provider store={store}>
      <SearchPage />
    </Provider>,
  );
  return userEvent.setup();
}

function searchInput() {
  return screen.getByRole('textbox', {name: 'Search products'});
}

function productCard(name: string) {
  return screen.getByRole('article', {name});
}

it('waits for user input without issuing a search', async () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let hasRequestedProducts = false;
  searchServer.use(
    http.get('*/api/products', () => {
      hasRequestedProducts = true;
      return HttpResponse.json({items: []});
    }),
  );
  renderSearchPage();
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(searchInput()).toHaveValue('');
  expect(screen.getByRole('status')).toHaveTextContent('Search for a product');
  expect(hasRequestedProducts).toBe(false);
});

function waitForMockedResponseFor(query: string, requestSignal: AbortSignal) {
  return new Promise<void>(resolve => {
    if (requestSignal.aborted) {
      resolve();
      return;
    }
    function finishWaiting() {
      searchServer.events.removeListener('response:mocked', listener);
      requestSignal.removeEventListener('abort', finishWaiting);
      resolve();
    }
    const listener = ({request}: {request: Request}) => {
      if (new URL(request.url).searchParams.get('query') === query) {
        finishWaiting();
      }
    };
    requestSignal.addEventListener('abort', finishWaiting, {once: true});
    searchServer.events.on('response:mocked', listener);
  });
}

it('normalizes surrounding and repeated whitespace before issuing HTTP', async () => {
  let receivedQuery: string | null = null;
  searchServer.use(
    http.get('*/api/products', ({request}) => {
      receivedQuery = new URL(request.url).searchParams.get('query');
      return HttpResponse.json({items: [lindenChair]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), '  LINDEN   chair  ');
  expect(
    await screen.findByRole('article', {name: 'LINDEN chair'}),
  ).toBeVisible();
  expect(receivedQuery).toBe('LINDEN chair');
});

it('retains leading zeros when searching by article number', async () => {
  let receivedQuery: string | null = null;
  searchServer.use(
    http.get('*/api/products', ({request}) => {
      receivedQuery = new URL(request.url).searchParams.get('query');
      return HttpResponse.json({items: [lindenChair]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), '00012345');
  expect(
    await screen.findByRole('article', {name: 'LINDEN chair'}),
  ).toBeVisible();
  expect(receivedQuery).toBe('00012345');
});

it('issues the request at 300 ms, never at 299 ms', async () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let requestCount = 0;
  let acknowledgeRequest!: () => void;
  const requestReceived = new Promise<void>(resolve => {
    acknowledgeRequest = resolve;
  });
  searchServer.use(
    http.get('*/api/products', () => {
      requestCount++;
      acknowledgeRequest();
      return HttpResponse.json({items: []});
    }),
  );
  const store = createApplicationStore();
  renderedStores.push(store);
  render(
    <Provider store={store}>
      <SearchPage />
    </Provider>,
  );
  fireEvent.change(searchInput(), {target: {value: 'LINDEN'}});
  await act(() => vi.advanceTimersByTimeAsync(299));
  expect(requestCount).toBe(0);
  await act(() => vi.advanceTimersByTimeAsync(1));
  await requestReceived;
  expect(requestCount).toBe(1);
});

it('restarts the debounce after another keystroke', async () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let receivedQuery: string | null = null;
  let acknowledgeRequest!: () => void;
  const requestReceived = new Promise<void>(resolve => {
    acknowledgeRequest = resolve;
  });
  searchServer.use(
    http.get('*/api/products', ({request}) => {
      receivedQuery = new URL(request.url).searchParams.get('query');
      acknowledgeRequest();
      return HttpResponse.json({items: []});
    }),
  );
  const store = createApplicationStore();
  renderedStores.push(store);
  render(
    <Provider store={store}>
      <SearchPage />
    </Provider>,
  );
  fireEvent.change(searchInput(), {target: {value: 'LIN'}});
  await act(() => vi.advanceTimersByTimeAsync(200));
  fireEvent.change(searchInput(), {target: {value: 'LINDEN'}});
  await act(() => vi.advanceTimersByTimeAsync(299));
  expect(receivedQuery).toBeNull();
  await act(() => vi.advanceTimersByTimeAsync(1));
  await requestReceived;
  expect(receivedQuery).toBe('LINDEN');
});

it('does not search for whitespace-only input', async () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let hasRequestedProducts = false;
  searchServer.use(
    http.get('*/api/products', () => {
      hasRequestedProducts = true;
      return HttpResponse.json({items: []});
    }),
  );
  const store = createApplicationStore();
  renderedStores.push(store);
  render(
    <Provider store={store}>
      <SearchPage />
    </Provider>,
  );
  fireEvent.change(searchInput(), {target: {value: '   '}});
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(hasRequestedProducts).toBe(false);
  expect(screen.getByRole('status')).toHaveTextContent('Search for a product');
});

it('cancels a pending search when the user clears the input', async () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let hasRequestedProducts = false;
  searchServer.use(
    http.get('*/api/products', () => {
      hasRequestedProducts = true;
      return HttpResponse.json({items: []});
    }),
  );
  const store = createApplicationStore();
  renderedStores.push(store);
  render(
    <Provider store={store}>
      <SearchPage />
    </Provider>,
  );
  fireEvent.change(searchInput(), {target: {value: 'LINDEN'}});
  await act(() => vi.advanceTimersByTimeAsync(200));
  fireEvent.change(searchInput(), {target: {value: ''}});
  await act(() => vi.advanceTimersByTimeAsync(500));
  expect(hasRequestedProducts).toBe(false);
});

it('clears previous cards immediately when criteria become blank', async () => {
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  expect(
    await screen.findByRole('article', {name: 'LINDEN chair'}),
  ).toBeVisible();
  await user.clear(searchInput());
  expect(
    screen.queryByRole('article', {name: 'LINDEN chair'}),
  ).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Search for a product');
});

it('shows loading until the actual HTTP response arrives', async () => {
  let releaseResponse!: () => void;
  const responseReleased = new Promise<void>(resolve => {
    releaseResponse = resolve;
  });
  searchServer.use(
    http.get('*/api/products', async () => {
      await responseReleased;
      return HttpResponse.json({items: [lindenChair]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  expect(await screen.findByText('Searching products…')).toBeVisible();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  releaseResponse();
  expect(
    await screen.findByRole('article', {name: 'LINDEN chair'}),
  ).toBeVisible();
});

it('renders the required card information and an indicative stock label', async () => {
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  const card = await screen.findByRole('article', {name: 'LINDEN chair'});
  expect(
    within(card).getByRole('img', {name: 'A wooden LINDEN dining chair'}),
  ).toBeVisible();
  expect(card).toHaveTextContent('00012345');
  expect(card).toHaveTextContent('A wooden dining chair.');
  expect(card).toHaveTextContent('12,990');
  expect(card).toHaveTextContent(/HUF|Ft/);
  expect(card).toHaveTextContent('Budapest');
  expect(card).toHaveTextContent('7 available');
  expect(card).toHaveTextContent(/indicative/i);
});

it('shows an explicit no-results state', async () => {
  searchServer.use(
    http.get('*/api/products', () => HttpResponse.json({items: []})),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'No matching product');
  expect(await screen.findByText('No products found')).toBeVisible();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

it.each(['network', 'service'] as const)(
  'recovers from a %s failure when the user retries current criteria',
  async failureKind => {
    const requestedCriteria: (string | null)[] = [];
    searchServer.use(
      http.get('*/api/products', ({request}) => {
        requestedCriteria.push(new URL(request.url).searchParams.get('query'));
        if (requestedCriteria.length === 1)
          return failureKind === 'network'
            ? HttpResponse.error()
            : HttpResponse.json(
                {code: 'PRODUCT_SEARCH_UNAVAILABLE'},
                {status: 503},
              );
        return HttpResponse.json({items: [lindenChair]});
      }),
    );
    const user = renderSearchPage();
    await user.type(searchInput(), 'LINDEN');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Product search failed',
    );
    await user.click(screen.getByRole('button', {name: 'Retry search'}));
    expect(
      await screen.findByRole('article', {name: 'LINDEN chair'}),
    ).toBeVisible();
    expect(requestedCriteria).toEqual(['LINDEN', 'LINDEN']);
  },
);

it.each(['json', 'html'] as const)(
  'rejects a malformed successful %s response instead of rendering products',
  async format => {
    searchServer.use(
      http.get('*/api/products', () =>
        format === 'json'
          ? HttpResponse.json({items: [{name: 'Unvalidated product'}]})
          : HttpResponse.text('<html>not products</html>'),
      ),
    );
    const user = renderSearchPage();
    await user.type(searchInput(), 'LINDEN');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid product response',
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  },
);

it('hides old cards while a new query waits for its response', async () => {
  let releaseNewResponse!: () => void;
  const newResponseReleased = new Promise<void>(resolve => {
    releaseNewResponse = resolve;
  });
  searchServer.use(
    http.get('*/api/products', async ({request}) => {
      if (new URL(request.url).searchParams.get('query') === 'LINDEN')
        return HttpResponse.json({items: [lindenChair]});
      await newResponseReleased;
      return HttpResponse.json({items: [bjorkTable]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  expect(
    await screen.findByRole('article', {name: 'LINDEN chair'}),
  ).toBeVisible();
  await user.clear(searchInput());
  await user.type(searchInput(), 'BJORK');
  expect(await screen.findByText('Searching products…')).toBeVisible();
  expect(
    screen.queryByRole('article', {name: 'LINDEN chair'}),
  ).not.toBeInTheDocument();
  releaseNewResponse();
  expect(
    await screen.findByRole('article', {name: 'BJORK table'}),
  ).toBeVisible();
});

it('never replaces the current result with a deliberately delayed old response', async () => {
  let oldRequestSignal!: AbortSignal;
  let releaseOldResponse!: () => void;
  let acknowledgeOldRequest!: () => void;
  const oldResponseReleased = new Promise<void>(resolve => {
    releaseOldResponse = resolve;
  });
  const oldRequestReceived = new Promise<void>(resolve => {
    acknowledgeOldRequest = resolve;
  });
  searchServer.use(
    http.get('*/api/products', async ({request}) => {
      if (new URL(request.url).searchParams.get('query') === 'LINDEN') {
        oldRequestSignal = request.signal;
        acknowledgeOldRequest();
        await oldResponseReleased;
        return HttpResponse.json({items: [lindenChair]});
      }
      return HttpResponse.json({items: [bjorkTable]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  await oldRequestReceived;
  await user.clear(searchInput());
  await user.type(searchInput(), 'BJORK');
  expect(
    await screen.findByRole('article', {name: 'BJORK table'}),
  ).toBeVisible();
  const oldResponseObserved = waitForMockedResponseFor(
    'LINDEN',
    oldRequestSignal,
  );
  await act(async () => {
    releaseOldResponse();
    await oldResponseObserved;
  });
  expect(productCard('BJORK table')).toBeVisible();
  expect(
    screen.queryByRole('article', {name: 'LINDEN chair'}),
  ).not.toBeInTheDocument();
});

it('does not resurrect results when a pending response arrives after clearing input', async () => {
  let clearedRequestSignal!: AbortSignal;
  let releaseResponse!: () => void;
  let acknowledgeRequest!: () => void;
  const responseReleased = new Promise<void>(resolve => {
    releaseResponse = resolve;
  });
  const requestReceived = new Promise<void>(resolve => {
    acknowledgeRequest = resolve;
  });
  searchServer.use(
    http.get('*/api/products', async ({request}) => {
      clearedRequestSignal = request.signal;
      acknowledgeRequest();
      await responseReleased;
      return HttpResponse.json({items: [lindenChair]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  await requestReceived;
  await user.clear(searchInput());
  const clearedResponseObserved = waitForMockedResponseFor(
    'LINDEN',
    clearedRequestSignal,
  );
  await act(async () => {
    releaseResponse();
    await clearedResponseObserved;
  });
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Search for a product');
});

it('retry uses edited criteria rather than the query that failed earlier', async () => {
  const requestedCriteria: (string | null)[] = [];
  searchServer.use(
    http.get('*/api/products', ({request}) => {
      requestedCriteria.push(new URL(request.url).searchParams.get('query'));
      if (requestedCriteria.length < 3)
        return HttpResponse.json(
          {code: 'PRODUCT_SEARCH_UNAVAILABLE'},
          {status: 503},
        );
      return HttpResponse.json({items: [bjorkTable]});
    }),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Product search failed',
  );
  await user.clear(searchInput());
  await user.type(searchInput(), 'BJORK');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Product search failed',
  );
  await user.click(screen.getByRole('button', {name: 'Retry search'}));
  expect(
    await screen.findByRole('article', {name: 'BJORK table'}),
  ).toBeVisible();
  expect(requestedCriteria).toEqual(['LINDEN', 'BJORK', 'BJORK']);
});

it('does not expose arbitrary server prose as an interface error', async () => {
  searchServer.use(
    http.get('*/api/products', () =>
      HttpResponse.json(
        {code: 'UNKNOWN', message: 'private database connection secret'},
        {status: 503},
      ),
    ),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid product response',
  );
  expect(
    screen.queryByText(/private database connection secret/),
  ).not.toBeInTheDocument();
});

it('displays zero stock rather than hiding the selected-store quantity', async () => {
  searchServer.use(
    http.get('*/api/products', () =>
      HttpResponse.json({
        items: [{...lindenChair, stock: {...lindenChair.stock, quantity: 0}}],
      }),
    ),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  const card = await screen.findByRole('article', {name: 'LINDEN chair'});
  expect(card).toHaveTextContent('Budapest');
  expect(card).toHaveTextContent('0 available');
});

it('formats a currency without fractional minor units without dividing its price by one hundred', async () => {
  searchServer.use(
    http.get('*/api/products', () =>
      HttpResponse.json({
        items: [{...lindenChair, price: {amountMinor: 12990, currency: 'JPY'}}],
      }),
    ),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  const card = await screen.findByRole('article', {name: 'LINDEN chair'});
  expect(card).toHaveTextContent('12,990');
  expect(card).toHaveTextContent('JPY');
});

it('formats fractional currency minor units through the HTTP response', async () => {
  searchServer.use(
    http.get('*/api/products', () =>
      HttpResponse.json({
        items: [
          {...lindenChair, price: {amountMinor: 1299000, currency: 'USD'}},
        ],
      }),
    ),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  const card = await screen.findByRole('article', {name: 'LINDEN chair'});
  expect(card).toHaveTextContent('12,990.00');
  expect(card).toHaveTextContent('USD');
});

it('converts AFN transport minor units independently of display rounding', async () => {
  searchServer.use(
    http.get('*/api/products', () =>
      HttpResponse.json({
        items: [
          {...lindenChair, price: {amountMinor: 1299000, currency: 'AFN'}},
        ],
      }),
    ),
  );
  const user = renderSearchPage();
  await user.type(searchInput(), 'LINDEN');
  const card = await screen.findByRole('article', {name: 'LINDEN chair'});
  expect(card).toHaveTextContent('AFN');
  expect(card).toHaveTextContent('12,990');
  expect(card).not.toHaveTextContent('1,299,000');
});

it('replaces the search label through its message contract', () => {
  const store = createApplicationStore();
  renderedStores.push(store);
  render(
    <Provider store={store}>
      <SearchPage
        messages={{...englishSearchMessages, searchLabel: 'Find furniture'}}
      />
    </Provider>,
  );
  expect(screen.getByRole('textbox', {name: 'Find furniture'})).toBeVisible();
  expect(
    screen.queryByRole('textbox', {name: 'Search products'}),
  ).not.toBeInTheDocument();
});

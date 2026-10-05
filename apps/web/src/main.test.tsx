import {afterAll, afterEach, beforeAll, expect, it, vi} from 'vitest';
import {screen, waitFor} from '@testing-library/react';
import {act} from 'react';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

const apiServer = setupServer(
  http.get('*/api/health', () =>
    HttpResponse.json({status: 'ok', service: 'aeki-api'}),
  ),
  http.get('*/api/readiness', () =>
    HttpResponse.json({status: 'ready', database: 'reachable'}),
  ),
);

const {startMockWorker} = vi.hoisted(() => ({
  startMockWorker: vi.fn<() => Promise<void>>(),
}));
vi.mock('msw/browser', () => ({setupWorker: () => ({start: startMockWorker})}));

beforeAll(() => apiServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
  vi.unstubAllEnvs();
  startMockWorker.mockReset();
  window.history.replaceState(null, '', '/');
});

it('starts opted-in development HTTP interception before rendering the search page', async () => {
  vi.stubEnv('DEV', true);
  vi.stubEnv('VITE_ENABLE_MOCKS', 'true');
  window.history.replaceState(null, '', '/search');
  document.body.innerHTML = '<div id="root"></div>';
  let releaseWorker!: () => void;
  startMockWorker.mockImplementation(
    () =>
      new Promise<void>(resolve => {
        releaseWorker = resolve;
      }),
  );
  const boot = import('./main');
  await waitFor(() => expect(startMockWorker).toHaveBeenCalledOnce());
  expect(
    screen.queryByRole('textbox', {name: 'Search products'}),
  ).not.toBeInTheDocument();
  await act(async () => {
    releaseWorker();
    await boot;
  });
  expect(screen.getByRole('textbox', {name: 'Search products'})).toBeVisible();
  expect(screen.getByText('Development fixtures')).toBeVisible();
});

it('does not start fixture interception in production even with an enabled flag', async () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_ENABLE_MOCKS', 'true');
  window.history.replaceState(null, '', '/search');
  document.body.innerHTML = '<div id="root"></div>';
  await act(async () => {
    await import('./main');
  });
  expect(screen.getByRole('textbox', {name: 'Search products'})).toBeVisible();
  expect(startMockWorker).not.toHaveBeenCalled();
  expect(screen.queryByText('Development fixtures')).not.toBeInTheDocument();
});

it('does not enable fixture interception for the false development flag', async () => {
  vi.stubEnv('DEV', true);
  vi.stubEnv('VITE_ENABLE_MOCKS', 'false');
  window.history.replaceState(null, '', '/search');
  document.body.innerHTML = '<div id="root"></div>';
  await act(async () => {
    await import('./main');
  });
  expect(startMockWorker).not.toHaveBeenCalled();
  expect(screen.queryByText('Development fixtures')).not.toBeInTheDocument();
});

it('does not render a pretend fixture journey when worker startup fails', async () => {
  vi.stubEnv('DEV', true);
  vi.stubEnv('VITE_ENABLE_MOCKS', 'true');
  document.body.innerHTML = '<div id="root"></div>';
  startMockWorker.mockRejectedValue(new Error('Worker unavailable'));
  await expect(import('./main')).rejects.toThrow('Worker unavailable');
  expect(screen.queryByText('Development fixtures')).not.toBeInTheDocument();
});
afterAll(() => apiServer.close());

it('fails with an actionable message when the host document has no application root', async () => {
  document.body.innerHTML = '';
  await expect(import('./main')).rejects.toThrow('Missing application root.');
});

it('boots the real application from its HTML root and displays live API results', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await act(async () => {
    await import('./main');
  });
  await waitFor(() => expect(screen.getByText('API reachable')).toBeVisible());
  expect(await screen.findByText('Database ready')).toBeVisible();
});

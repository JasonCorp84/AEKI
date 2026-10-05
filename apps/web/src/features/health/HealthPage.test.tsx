import {afterAll, afterEach, beforeAll, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {delay, http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import userEvent from '@testing-library/user-event';
import {createApplicationStore} from '../../app/store';
import {HealthPage} from './HealthPage';
const mockHealthServer = setupServer(
  http.get('*/api/health', () =>
    HttpResponse.json({status: 'ok', service: 'aeki-api'}),
  ),
  http.get('*/api/readiness', () =>
    HttpResponse.json({status: 'ready', database: 'reachable'}),
  ),
);
beforeAll(() => mockHealthServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => mockHealthServer.resetHandlers());
afterAll(() => mockHealthServer.close());
function renderHealthPageWithStore() {
  const applicationStore = createApplicationStore();
  render(
    <Provider store={applicationStore}>
      <HealthPage />
    </Provider>,
  );
  return applicationStore;
}
it('shows the reachable API after the actual RTK Query client receives a valid HTTP response', async () => {
  renderHealthPageWithStore();
  expect(await screen.findByText('API reachable')).toBeVisible();
});
it('recovers from a transport failure when the user retries', async () => {
  mockHealthServer.use(
    http.get('*/api/health', () => HttpResponse.error(), {once: true}),
  );
  renderHealthPageWithStore();
  expect(await screen.findByText('API unreachable')).toBeVisible();
  await userEvent
    .setup()
    .click(screen.getByRole('button', {name: 'Retry connection'}));
  expect(await screen.findByText('API reachable')).toBeVisible();
});
it('shows a contract error rather than a healthy state for malformed successful HTTP data', async () => {
  mockHealthServer.use(
    http.get('*/api/health', () => HttpResponse.json({status: 'ok'})),
  );
  renderHealthPageWithStore();
  expect(await screen.findByText('Invalid API response')).toBeVisible();
  expect(screen.queryByText('API reachable')).not.toBeInTheDocument();
});
it('keeps the connection in a visible loading state until the HTTP response arrives', async () => {
  mockHealthServer.use(
    http.get('*/api/health', async () => {
      await delay(150);
      return HttpResponse.json({status: 'ok', service: 'aeki-api'});
    }),
  );
  renderHealthPageWithStore();
  expect(screen.getByText('Checking API…')).toBeVisible();
  expect(screen.getByRole('button', {name: 'Retry connection'})).toBeDisabled();
  expect(await screen.findByText('API reachable')).toBeVisible();
});
it('identifies a non-JSON successful response as invalid, rather than reporting a transport outage', async () => {
  mockHealthServer.use(
    http.get('*/api/health', () =>
      HttpResponse.text('<html>not a health report</html>'),
    ),
  );
  renderHealthPageWithStore();
  expect(await screen.findByText('Invalid API response')).toBeVisible();
});

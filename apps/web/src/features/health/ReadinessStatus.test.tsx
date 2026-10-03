import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createApplicationStore } from '../../app/store';
import { HealthPage } from './HealthPage';
import userEvent from '@testing-library/user-event';

const mockStatusServer = setupServer(
  http.get('*/api/health', () => HttpResponse.json({ status: 'ok', service: 'aeki-api' })),
  http.get('*/api/readiness', () => HttpResponse.json({ status: 'ready', database: 'reachable' })),
);
beforeAll(() => mockStatusServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockStatusServer.resetHandlers());
afterAll(() => mockStatusServer.close());

function renderStatusPage() {
  render(<Provider store={createApplicationStore()}><HealthPage /></Provider>);
}

it('shows real-client database readiness separately from API liveness', async () => {
  renderStatusPage();
  expect(await screen.findByText('API reachable')).toBeVisible();
  expect(await screen.findByText('Database ready')).toBeVisible();
});

it('does not invent a database outage when the readiness request fails and recovers on retry', async () => {
  mockStatusServer.use(http.get('*/api/readiness', () => HttpResponse.error(), { once: true }));
  renderStatusPage();
  expect(await screen.findByText('Readiness check failed')).toBeVisible();
  expect(await screen.findByText('API reachable')).toBeVisible();
  expect(screen.queryByText('Database not ready')).not.toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Retry database check' }));
  expect(await screen.findByText('Database ready')).toBeVisible();
});

it.each([
  [200, { status: 'not_ready', database: 'unreachable', code: 'DATABASE_UNAVAILABLE' }],
  [503, { status: 'ready', database: 'reachable' }],
  [503, { status: 'not_ready', database: 'unreachable', code: 'UNKNOWN' }],
])('rejects a mismatched or invalid readiness status/body pair: %s, %j', async (httpStatus, responseBody) => {
  mockStatusServer.use(http.get('*/api/readiness', () => HttpResponse.json(responseBody, { status: httpStatus })));
  renderStatusPage();
  expect(await screen.findByText('Invalid readiness response')).toBeVisible();
  expect(screen.queryByText('Database ready')).not.toBeInTheDocument();
});

it('rejects non-JSON readiness rather than reporting a known database outage', async () => {
  mockStatusServer.use(http.get('*/api/readiness', () => HttpResponse.text('uncontracted response', { status: 503 })));
  renderStatusPage();
  expect(await screen.findByText('Invalid readiness response')).toBeVisible();
});

it('explains a contracted timeout while preserving visible API liveness', async () => {
  mockStatusServer.use(http.get('*/api/readiness', () => HttpResponse.json({
    status: 'not_ready', database: 'unreachable', code: 'DATABASE_TIMEOUT',
  }, { status: 503 })));
  renderStatusPage();
  expect(await screen.findByText('Database not ready')).toBeVisible();
  expect(screen.getByText('The database check exceeded its time limit. The API is still responding.')).toBeVisible();
});

it('replaces previous success with checking feedback during a delayed readiness retry', async () => {
  renderStatusPage();
  expect(await screen.findByText('Database ready')).toBeVisible();
  let releaseReadinessResponse = () => {};
  const pendingReadinessResponse = new Promise<void>((resolve) => { releaseReadinessResponse = resolve; });
  mockStatusServer.use(http.get('*/api/readiness', async () => {
    await pendingReadinessResponse;
    return HttpResponse.json({ status: 'ready', database: 'reachable' });
  }));
  try {
    await userEvent.setup().click(screen.getByRole('button', { name: 'Check database again' }));
    expect(await screen.findByText('Checking database…')).toBeVisible();
    expect(screen.queryByText('Database ready')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry database check' })).toBeDisabled();
  } finally {
    releaseReadinessResponse();
  }
  expect(await screen.findByText('Database ready')).toBeVisible();
});

it('identifies malformed readiness instead of claiming a database or transport outage', async () => {
  mockStatusServer.use(http.get('*/api/readiness', () => HttpResponse.json({ status: 'ready' })));
  renderStatusPage();
  expect(await screen.findByText('Invalid readiness response')).toBeVisible();
  expect(screen.queryByText('Database ready')).not.toBeInTheDocument();
});

it('keeps API liveness visible during a contracted database outage and recovers on retry', async () => {
  mockStatusServer.use(http.get('*/api/readiness', () => HttpResponse.json({
    status: 'not_ready', database: 'unreachable', code: 'DATABASE_UNAVAILABLE',
  }, { status: 503 }), { once: true }));
  renderStatusPage();
  expect(await screen.findByText('Database not ready')).toBeVisible();
  expect(await screen.findByText('API reachable')).toBeVisible();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Retry database check' }));
  expect(await screen.findByText('Database ready')).toBeVisible();
});

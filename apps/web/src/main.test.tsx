import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const apiServer = setupServer(
  http.get('*/api/health', () => HttpResponse.json({ status: 'ok', service: 'aeki-api' })),
  http.get('*/api/readiness', () => HttpResponse.json({ status: 'ready', database: 'reachable' })),
);

beforeAll(() => apiServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
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

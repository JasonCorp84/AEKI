import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e-search',
  testMatch: 'disabled-fixtures.spec.mjs',
  outputDir: './test-results/search-disabled',
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 15000,
  expect: {timeout: 5000},
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    channel: 'chromium',
    baseURL: 'http://127.0.0.1:4352',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'npm run build -w @aeki/contracts && node node_modules/vite/bin/vite.js apps/web --mode search-fixtures --host 127.0.0.1 --strictPort --port 4352',
    url: 'http://127.0.0.1:4352',
    timeout: 30000,
    reuseExistingServer: false,
    env: {VITE_ENABLE_MOCKS: 'false', VITE_API_BASE_URL: '/api/'},
    stdout: 'pipe',
    stderr: 'pipe',
    gracefulShutdown: {signal: 'SIGTERM', timeout: 5000},
  },
});

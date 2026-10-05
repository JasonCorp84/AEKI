import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e-search',
  testMatch: 'production-search.spec.mjs',
  outputDir: './test-results/search-production',
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 15000,
  expect: {timeout: 5000},
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    channel: 'chromium',
    baseURL: 'http://127.0.0.1:4351',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'npm run build -w @aeki/web -- --mode browser-test && node node_modules/vite/bin/vite.js preview apps/web --mode browser-test --host 127.0.0.1 --strictPort --port 4351',
    url: 'http://127.0.0.1:4351',
    timeout: 60000,
    reuseExistingServer: false,
    env: {
      VITE_ENABLE_MOCKS: 'true',
      VITE_API_BASE_URL: '/api/',
      VITE_API_PROXY_TARGET: 'http://127.0.0.1:9',
    },
    stdout: 'pipe',
    stderr: 'pipe',
    gracefulShutdown: {signal: 'SIGTERM', timeout: 5000},
  },
});

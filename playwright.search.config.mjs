import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './e2e-search',
  testMatch: 'fixture-search.spec.mjs',
  outputDir: './test-results/search-fixtures',
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 15000,
  expect: {timeout: 5000},
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4350',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'fixture-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: {width: 1280, height: 900},
      },
    },
    {
      name: 'fixture-mobile',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        viewport: {width: 375, height: 812},
      },
    },
  ],
  webServer: {
    command:
      'npm run build -w @aeki/contracts && node node_modules/vite/bin/vite.js apps/web --mode search-fixtures --host 127.0.0.1 --strictPort --port 4350',
    url: 'http://127.0.0.1:4350',
    timeout: 30000,
    reuseExistingServer: false,
    env: {VITE_ENABLE_MOCKS: 'true', VITE_API_BASE_URL: '/api/'},
    stdout: 'pipe',
    stderr: 'pipe',
    gracefulShutdown: {signal: 'SIGTERM', timeout: 5000},
  },
});

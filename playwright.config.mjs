import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 90000,
  expect: {timeout: 10000},
  reporter: [['list'], ['html', {open: 'never'}]],
  use: {
    browserName: 'chromium',
    channel: 'chromium',
    baseURL: `http://127.0.0.1:${process.env.BROWSER_WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node apps/api/dist/main.js',
      url: `http://127.0.0.1:${process.env.API_PORT}/readiness`,
      timeout: 30000,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
      gracefulShutdown: {signal: 'SIGTERM', timeout: 5000},
    },
    {
      command: `node ../../node_modules/vite/bin/vite.js preview --mode browser-test --host 127.0.0.1 --strictPort --port ${process.env.BROWSER_WEB_PORT}`,
      cwd: './apps/web',
      url: `http://127.0.0.1:${process.env.BROWSER_WEB_PORT}`,
      timeout: 30000,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
      gracefulShutdown: {signal: 'SIGTERM', timeout: 5000},
    },
  ],
});

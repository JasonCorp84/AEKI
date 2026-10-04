import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000,
    include: ['test/**/*.test.mjs'],
    coverage: {
      enabled: process.env['AEKI_COVERAGE'] === '1',
      provider: 'v8',
      include: ['dist/**/*.js', 'src/**/*.ts'],
      reporter: ['json', 'text', 'html'],
      reportsDirectory: '../../coverage/api',
    },
  },
});

import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: process.env['AEKI_COVERAGE'] === '1',
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/**/*.test.ts'],
      reporter: ['json', 'text', 'html'],
      reportsDirectory: '../../coverage/contracts',
    },
  },
});

import googleTypeScriptStyle from 'gts';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/generated/**',
      'apps/web/prototype/**',
      '.teaching/**',
      '.conversations/**',
      'playwright-report/**',
      'test-results/**',
      'browser-services/**',
    ],
  },
  ...googleTypeScriptStyle,
  {
    languageOptions: {globals: {...globals.node, ...globals.browser}},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {project: './tsconfig.eslint.json'},
    },
  },
];

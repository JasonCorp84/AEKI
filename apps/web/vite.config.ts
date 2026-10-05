import {defineConfig, loadEnv} from 'vite';
export default defineConfig(({mode, command}) => {
  const isBrowserTest = mode === 'browser-test';
  const developmentEnvironment = isBrowserTest
    ? process.env
    : loadEnv(mode, '../..', '');
  const fixtureFlag =
    developmentEnvironment['VITE_ENABLE_MOCKS'] ??
    (command === 'serve' && mode === 'search-fixtures' ? 'true' : 'false');
  return {
    envDir: isBrowserTest ? false : '../..',
    define: {
      'import.meta.env.VITE_ENABLE_MOCKS': JSON.stringify(fixtureFlag),
      ...(isBrowserTest
        ? {'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api/')}
        : {}),
    },
    server: {
      host: '127.0.0.1',
      port: Number(developmentEnvironment['WEB_PORT'] ?? 5173),
      strictPort: true,
      proxy: {
        '/api': {
          target:
            developmentEnvironment['VITE_API_PROXY_TARGET'] ??
            'http://127.0.0.1:3000',
          rewrite: requestPath => requestPath.replace(/^\/api/, ''),
        },
      },
    },
  };
});

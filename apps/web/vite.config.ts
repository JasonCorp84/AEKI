import {defineConfig, loadEnv} from 'vite';
export default defineConfig(({mode}) => {
  const isBrowserTest = mode === 'browser-test';
  const developmentEnvironment = isBrowserTest
    ? process.env
    : loadEnv(mode, '../..', '');
  return {
    envDir: isBrowserTest ? false : '../..',
    ...(isBrowserTest
      ? {define: {'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api/')}}
      : {}),
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

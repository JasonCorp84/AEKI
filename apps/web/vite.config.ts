import {defineConfig, loadEnv} from 'vite';
export default defineConfig(({mode}) => {
  const developmentEnvironment = loadEnv(mode, '../..', '');
  return {
    envDir: '../..',
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

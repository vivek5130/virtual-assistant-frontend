import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api is proxied to the backend so the browser never needs CORS or
// any AI credentials. Set VITE_API_URL for deployed builds.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT || 7007),
      strictPort: true,
      proxy: { '/api': { target: env.VITE_DEV_BACKEND || 'http://localhost:7008', changeOrigin: true } },
    },
    optimizeDeps: { exclude: ['lucide-react'] },
  };
});

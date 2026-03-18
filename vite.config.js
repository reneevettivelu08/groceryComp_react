import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request to /api/* gets forwarded to the Express server
      // This means the browser never directly calls localhost:3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // In production, the API URL comes from an env variable set in Netlify
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || ''),
  },
});
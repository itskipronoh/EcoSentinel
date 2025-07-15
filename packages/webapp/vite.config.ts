import process from 'node:process';
import { resolve } from 'node:path'; // ✅ needed to resolve HTML paths
import { defineConfig } from 'vite';

// Expose environment variables to the client
process.env.VITE_API_URL = process.env.API_URL ?? '';
console.log(`Using chat API base URL: "${process.env.VITE_API_URL}"`);


export default defineConfig({
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html'),
        alerts: resolve(__dirname, 'alerts.html'),
        about: resolve(__dirname, 'about.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:7071',
    },
  },
});

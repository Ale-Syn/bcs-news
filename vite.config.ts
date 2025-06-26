import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    // Configuración para evitar problemas de CSP en desarrollo
    fs: {
      strict: false
    }
  },
  define: {
    // Evitar problemas con eval en desarrollo
    global: 'globalThis',
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          appwrite: ['appwrite'],
          'react-query': ['@tanstack/react-query'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  // Configuración específica para evitar CSP con eval
  esbuild: {
    drop: [],
  },
});

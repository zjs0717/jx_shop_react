import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    open: true,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8017',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8017',
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'zustand', 'echarts'],
  },
})

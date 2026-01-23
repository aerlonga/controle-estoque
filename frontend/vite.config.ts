import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      '@tanstack/react-query',
      '@tanstack/react-router',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui/material') || id.includes('@emotion')) {
              return 'mui-core'
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons'
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
})

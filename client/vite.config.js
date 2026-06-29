import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,   // ← fixes CJS/ESM mixing issues
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
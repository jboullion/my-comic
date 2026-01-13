import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // Proxy CivitAI API requests to avoid CORS issues in development
      '/api/civitai': {
        target: 'https://civitai.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/civitai/, ''),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages hosting
  // Must match the repository name: https://<user>.github.io/uofl-course-catalog-challenge/
  base: '/uofl-course-catalog-challenge/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
})

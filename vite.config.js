import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages hosting
  // Must match the repository name: https://feranando0241.github.io/uofl-course-catalog-challange/
  base: '/uofl-course-catalog-challange/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'node',
  },
})

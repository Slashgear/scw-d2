import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built assets resolve correctly whether the app is
// served from a domain root or a GitHub Pages project subpath (/repo-name/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})

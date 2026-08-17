import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages is served from /Vibe-color-studio/; local `npm run dev` stays at /.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Vibe-color-studio/' : '/',
  plugins: [react(), tailwindcss()],
})

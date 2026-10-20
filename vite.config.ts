import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5273, open: true },
  build: {
    target: 'es2020',
    // The WebGL scene is lazy-loaded (see Layout.tsx), so three.js lands in its
    // own async chunk automatically — no manual chunking needed.
    chunkSizeWarningLimit: 1000,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// strictPort keeps the dev server on 5173, the origin your backend's CORS allows.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})

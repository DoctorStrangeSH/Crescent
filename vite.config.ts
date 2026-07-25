import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Crescent/', // ← важно: название вашего репозитория
  server: {
    port: 3000,
    open: true
  }
})
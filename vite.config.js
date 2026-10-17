import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: path.join(os.tmpdir(), 'vite-cache-sistema-novo'),
  resolve: {
    alias: {
      'lucide-react': path.resolve('./node_modules/lucide-react/dist/cjs/lucide-react.js'),
    },
  },
  server: {
    open: true,
  },
})

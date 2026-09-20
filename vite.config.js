import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Forces a single React instance across all deps — standard hygiene
    // against duplicate-React bugs. Kept even though it did not fix the
    // known dev-server-only console warning noted in main.jsx.
    dedupe: ['react', 'react-dom'],
  },
})

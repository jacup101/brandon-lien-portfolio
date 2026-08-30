import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allows reaching the dev server through Tailscale Serve
    // (https://dev.tail85afd5.ts.net) when testing from another device.
    allowedHosts: ['dev.tail85afd5.ts.net'],
  },
})

import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Phone testing: the camera only works on HTTPS (or localhost). Two options:
//  1. VS Code port forwarding / Dev Tunnels: run plain `npm run dev`. The tunnel already gives you HTTPS.
//  2. Same Wi-Fi: run with HTTPS=1 and `--host` to serve over a self-signed certificate.
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(process.env.HTTPS ? [basicSsl()] : [])],
  server: {
    // Vite blocks unknown hostnames by default; allow VS Code Dev Tunnels and ngrok-style tunnels.
    // .localhost: gym addresses in development, e.g. iron-haven.localhost:5173
    allowedHosts: ['.localhost', '.devtunnels.ms', '.ngrok-free.app', '.trycloudflare.com'],
    // The app calls /api/v1 on its own origin; Vite forwards it to ssph-backend.
    // So a phone on the tunnel URL reaches the API too, with no CORS setup.
    proxy: {
      '/api': { target: process.env.API_PROXY_TARGET ?? 'http://localhost:4000', changeOrigin: true },
    },
  },
})

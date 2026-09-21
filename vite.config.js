import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    plugins: [react()],

    build: {
      // No source maps in production — keeps bundle size smaller and avoids
      // exposing readable source to the public.
      sourcemap: false,

      rollupOptions: {
        output: {
          // Split vendor chunks for better cache efficiency
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
    },

    server: {
      // Preferred dev port. Falls back if already in use (e.g. VS Code holds 5173).
      port: 5173,
      strictPort: false,

      // Dev-only proxy: forwards /api/* to the Spring Boot backend so the
      // browser never makes a cross-origin request in development.
      // In production this block is unused — all requests go directly to
      // VITE_API_BASE_URL from the browser.
      proxy: {
        '/api': {
          target      : env.VITE_API_BASE_URL || 'http://localhost:8081',
          changeOrigin: true,
          secure      : false,
          // Rewrite the Origin header to match the backend's CORS_ALLOWED_ORIGIN
          // so the CORS filter accepts the request regardless of which port
          // Vite happens to start on.
          headers: {
            origin: env.CORS_ALLOWED_ORIGIN || 'http://localhost:5173',
          },
        },
      },
    },
  }
})

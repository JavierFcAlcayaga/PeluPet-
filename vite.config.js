import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Fallbacks si no existen variables en .env.local
  const GENERAL = env.VITE_XANO_BASE_URL_GENERAL || env.VITE_XANO_BASE_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:YQMhoR_R'
  const AUTH = env.VITE_XANO_BASE_URL_AUTH || env.VITE_XANO_BASE_URL || GENERAL
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      proxy: {
        '/xano-auth': {
          target: AUTH,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/xano-auth/, ''),
          secure: true,
        },
        '/xano-general': {
          target: GENERAL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/xano-general/, ''),
          secure: true,
        },
      },
    },
  }
})

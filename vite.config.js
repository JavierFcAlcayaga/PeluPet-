import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
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
          target: env.VITE_XANO_BASE_URL_AUTH,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/xano-auth/, ''),
          secure: true,
        },
        '/xano-general': {
          target: env.VITE_XANO_BASE_URL_GENERAL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/xano-general/, ''),
          secure: true,
        },
      },
    },
  }
})

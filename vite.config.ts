import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx, type ManifestV3Export } from '@crxjs/vite-plugin';
import path from 'node:path';
import baseManifest from './src/manifest';

const HMR_PORT = 5173;

export default defineConfig(({ mode }) => {
  // In dev, MV3's default CSP blocks the HMR websocket. Explicitly allow
  // localhost ws/http connections from extension pages so HMR can reach us.
  const devCsp = {
    extension_pages: `script-src 'self'; object-src 'self'; connect-src 'self' http://localhost:${HMR_PORT} ws://localhost:${HMR_PORT} http://127.0.0.1:${HMR_PORT} ws://127.0.0.1:${HMR_PORT}`,
  };

  const manifest: ManifestV3Export =
    mode === 'development'
      ? ({ ...baseManifest, content_security_policy: devCsp } as ManifestV3Export)
      : baseManifest;

  return {
    plugins: [react(), crx({ manifest })],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          player: path.resolve(__dirname, 'src/modules/player/index.html'),
        },
      },
    },
    server: {
      port: HMR_PORT,
      strictPort: true,
      cors: true,
      hmr:
        mode === 'development'
          ? { protocol: 'ws', host: 'localhost', port: HMR_PORT }
          : false,
    },
  };
});

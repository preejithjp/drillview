import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import eslintPlugin from "@nabla/vite-plugin-eslint";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const backendPort = parseInt(process.env.PORT || '8080');
const frontendPort = backendPort + 1;

// load environment variables to vue app bundle
Object.keys(process.env)
  .filter((e) => e.startsWith('APP_'))
  .forEach(function (e) {
    process.env['VITE_' + e] = process.env[e] || '';
  });

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'emoji-picker'
        }
      }
    }),
    vueDevTools(),
    eslintPlugin({
      eslintOptions: { 
        overrideConfigFile: "./src/eslint.config.mjs",
        fix: true,
      }
    })
  ],
  build: {
    outDir: path.join(__dirname, 'dist', 'public'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: frontendPort,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true
      },
    },
    watch: {
      ignored: [/node_modules/, /dist/]
    }
  },
});

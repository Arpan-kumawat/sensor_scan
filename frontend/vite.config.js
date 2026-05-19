import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [react(), tailwindcss(), ...(isDev ? [basicSsl()] : [])],
    server: {
      host: true,
      https: isDev,
      proxy: isDev
        ? {
            '/api': {
              target: 'http://127.0.0.1:5000',
              changeOrigin: true,
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/tesseract.js')) return 'ocr';
            if (id.includes('node_modules')) return 'vendor';
          },
        },
      },
    },
  };
});

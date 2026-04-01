import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'analyze' 
      ? [visualizer({ 
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
        })]
      : []
    ),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
          }
          // Components chunk
          if (id.includes('/src/components/')) {
            return 'components';
          }
          // Hooks chunk
          if (id.includes('/src/hooks/')) {
            return 'hooks';
          }
        },
      },
    },
  },
  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}));

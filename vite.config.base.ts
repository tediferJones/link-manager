import path from 'node:path';
import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/vite';

export const baseConfig = defineConfig({
  plugins: [ tailwind() ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    jsxInject: 'import { h, Fragment } from "jsx-dom";',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  test: {
    environment: 'jsdom',
  },
});

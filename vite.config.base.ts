import { defineConfig } from 'vite';
import path from 'node:path';

export const baseConfig = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});

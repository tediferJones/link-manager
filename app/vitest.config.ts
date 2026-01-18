import { defineConfig } from 'vitest/config';
import path from 'node:path';
// FIX ME remove tsconfigPaths via npm if not used
// import tsconfigPaths from 'vite-tsconfig-paths';
// FIX ME this might not be needed here
// either use tailwind plugin in pwa and extension
// or only use it once here
// import tailwind from '@tailwindcss/vite';

export default defineConfig({
  // plugins: [ tsconfigPaths() ],
  // plugins: [ tailwind() ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    setupFiles: './vitest.init.ts',
    environment: 'jsdom',
  },
  esbuild: {
    jsxInject: "import { h, Fragment } from 'jsx-dom';",
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})

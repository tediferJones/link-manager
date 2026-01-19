import { defineConfig, mergeConfig } from 'vitest/config';
// FIX ME remove tsconfigPaths via npm if not used
// import tsconfigPaths from 'vite-tsconfig-paths';
// FIX ME this might not be needed here
// either use tailwind plugin in pwa and extension
// or only use it once here
// import tailwind from '@tailwindcss/vite';
import { baseConfig } from '../vite.config.base';

export default mergeConfig(
  baseConfig,
  defineConfig({
    // plugins: [ tsconfigPaths() ],
    // plugins: [ tailwind() ],
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
);

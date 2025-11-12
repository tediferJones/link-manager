import { defineConfig, mergeConfig } from 'vite';
import { baseConfig } from '../vite.config.base';
// @ts-ignore
import tailwind from '@tailwindcss/vite';

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [ tailwind() ],
    server: {
      port: 3000,
    },
    esbuild: {
      jsxInject: "import { h, Fragment } from 'jsx-dom';",
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  }),
);

import { crx } from '@crxjs/vite-plugin'
import { defineConfig, mergeConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.js'
import { name, version } from './package.json'
// @ts-ignore
import tailwind from '@tailwindcss/vite'
import { baseConfig } from '../vite.config.base.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      crx({ manifest }),
      zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
      tailwind(),
    ],
    server: {
      cors: {
        origin: [
          /chrome-extension:\/\//,
        ],
      },
    },
    esbuild: {
      jsxInject: "import { h, Fragment } from 'jsx-dom';",
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  })
)

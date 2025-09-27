import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import { defineConfig } from 'vitest/config'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.js'
import { name, version } from './package.json'

export default defineConfig({
  test: {
    setupFiles: './vitest.init.ts'
  },
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
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

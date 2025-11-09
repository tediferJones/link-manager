import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import { defineConfig, mergeConfig } from 'vitest/config'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.js'
import { name, version } from './package.json'
import tailwind from '@tailwindcss/vite';
import { baseConfig } from '../vite.config.base.js'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      setupFiles: './vitest.init.ts',
      environment: 'jsdom',
    },
    resolve: {
      alias: {
        '@': `${path.resolve(__dirname, 'src')}`,
        '~': `${path.resolve(__dirname, '../')}`
      },
    },
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
);

// import path from 'node:path'
// import { crx } from '@crxjs/vite-plugin'
// import { defineConfig } from 'vitest/config'
// import zip from 'vite-plugin-zip-pack'
// import manifest from './manifest.config.js'
// import { name, version } from './package.json'
// import tailwind from '@tailwindcss/vite';
// 
// export default defineConfig({
//   test: {
//     setupFiles: './vitest.init.ts',
//     environment: 'jsdom',
//   },
//   resolve: {
//     alias: {
//       '@': `${path.resolve(__dirname, 'src')}`,
//     },
//   },
//   plugins: [
//     crx({ manifest }),
//     zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
//     tailwind(),
//   ],
//   server: {
//     cors: {
//       origin: [
//         /chrome-extension:\/\//,
//       ],
//     },
//   },
//   esbuild: {
//     jsxInject: "import { h, Fragment } from 'jsx-dom';",
//     jsxFactory: 'h',
//     jsxFragment: 'Fragment',
//   },
// })

import { defineConfig, mergeConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import { baseConfig } from '../vite.config.base.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      extensions: [ '.js', '.ts' ],
    },
    server: {
      port: 8000,
    },
    plugins: [
      VitePluginNode({
        adapter: 'express',
        appPath: './src/index.ts',
        exportName: 'app',
        tsCompiler: 'esbuild',
      })
    ]
  })
)

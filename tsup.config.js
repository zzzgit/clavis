import { readFile } from 'node:fs/promises'
import { transformAsync } from '@babel/core'
import solidPreset from 'babel-preset-solid'
import { defineConfig } from 'tsup'

const solidPlugin = {
  name: 'opentui-solid',
  setup(build) {
    build.onLoad({ filter: /src\/tui\/.*\.(js|jsx)$/ }, (args) =>
      readFile(args.path, 'utf8').then((source) => transformAsync(source, {
        filename: args.path,
        presets: [[solidPreset, { moduleName: '@opentui/solid', generate: 'universal' }]],
        sourceMaps: true
      })).then((result) => ({ contents: result.code, loader: 'js' }))
    )
  }
}

export default defineConfig({
  entry: { index: 'src/index.js', tui: 'src/tui/index.js' },
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  outDir: 'dist',
  esbuildPlugins: [solidPlugin],
  loader: { '.js': 'jsx' },
  external: ['@opentui/core', '@opentui/solid', '@opentui/keymap', 'solid-js'],
  onSuccess: 'echo "Build completed successfully"'
})

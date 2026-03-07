import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.js',
    'tui': 'src/tui/index.js'
  },
  format: ['esm'],
  target: 'node20',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  outDir: 'dist',
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
  external: ['react', 'ink', 'ink-select-input', 'ink-spinner', 'ink-table', 'ink-text-input'],
  onSuccess: 'echo "Build completed successfully"'
})
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/overlay.js'],
  format: ['cjs', 'es'],
  target: 'node16',
  minify: false,
})

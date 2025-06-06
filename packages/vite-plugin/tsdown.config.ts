import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index', 'src/overlay'],
  format: ['cjs'],
  target: 'node18',
  minify: false,
})

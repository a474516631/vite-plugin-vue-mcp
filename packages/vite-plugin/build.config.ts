import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/overlay',
  ],
  clean: true,
  declaration: true,
  outDir: 'dist',
  rollup: {
    emitCJS: true,
  },
})

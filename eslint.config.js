// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    formatters: true,
    rules: {
      'ts/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },

)

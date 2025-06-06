// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    vue: true,
    rules: {
      'ts/explicit-function-return-type': 'off',
      'no-console': 'off',
      'vue/max-attributes-per-line': 'error',
      'ts/no-use-before-define': 'off',
      'jsdoc/check-property-names': 'off',
      'jsdoc/check-param-names': 'off',
    },

  },

)

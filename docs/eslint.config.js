import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '**/*.js',
    '.env.*',
  ],
}, {
  rules: {
    'no-console': 'off',
  },
})

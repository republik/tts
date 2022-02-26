module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['standard', 'prettier', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    camelcase: 'off',
    'prettier/prettier': 'error',
  },
}

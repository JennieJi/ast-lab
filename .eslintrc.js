module.exports = {
  root: true,
  extends: 'eslint:recommended',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'prettier'],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
  },
  rules: {
    'prettier/prettier': 'error'
  }
};

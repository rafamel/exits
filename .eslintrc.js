const globals = require('eslint-restricted-globals');

module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: ['standard', 'plugin:import/errors', 'prettier'],
  env: {
    node: true,
    jest: true
  },
  parserOptions: {
    impliedStrict: true
  },
  plugins: ['prettier', 'jest', 'import', 'babel'],
  globals: { Partial: true },
  rules: {
    /* DISABLED */
    'standard/no-callback-literal': 0,
    /* WARNINGS */
    'no-warning-comments': [
      1,
      { terms: ['xxx', 'fixme', 'todo', 'refactor'], location: 'start' }
    ],
    'no-unused-vars': 1,
    'no-console': 1,
    'babel/no-invalid-this': 1,
    'babel/semi': 1,
    /* ERRORS */
    'no-restricted-globals': [2, 'fetch'].concat(globals), // Add custom globals
    'prettier/prettier': [2, require('./.prettierrc')] // Prettier
  },
  settings: {
    // babel-plugin-module-resolver
    'import/resolver': {
      'babel-module': {}
    },
    // eslint-import-resolver-typescript
    'import/resolver': {
      typescript: {}
    }
  }
};

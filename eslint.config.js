export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
      },
    },
    rules: {
      eqeqeq: 'error',
      'no-undef': 'error',
      'no-unused-vars': 'error',
    },
  },
]

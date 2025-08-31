module.exports = {
  extends: 'expo',
  ignorePatterns: [
    '/dist/*',
    '.eslintrc.js',
    'metro.config.js',
    'jest.config.js',
    'babel.config.js'
  ],
  rules: {
    '@typescript-eslint/no-unused-expressions': 'off',
    'no-unused-expressions': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off',
        'no-unused-expressions': 'off'
      }
    }
  ]
};

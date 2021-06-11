module.exports = {
  root: true,

  env: {
    es6: true,
    browser: true,
    node: true,
  },

  plugins: ['react', 'prettier'],

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],

  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },

  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': ['error', { singleQuote: true, semi: false }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}

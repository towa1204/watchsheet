module.exports = {
  env: {
    browser: true,
    es2021: true,
    'googleappsscript/googleappsscript': true,
  },
  extends: ['airbnb-base', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'googleappsscript'],
  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
  },
};

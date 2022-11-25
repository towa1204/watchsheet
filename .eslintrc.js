module.exports = {
  env: {
    browser: true,
    es2021: true,
    'googleappsscript/googleappsscript': true,
  },
  extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
  plugins: ['googleappsscript'],
  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
  },
};

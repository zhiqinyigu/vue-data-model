module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends: 'eslint:recommended',
  env: {
    browser: true,
    node: true,
    amd: true,
    es6: true,
    worker: false,
    mocha: false,
    phantomjs: false,
    serviceworker: false,
    jest: true,
  },
};

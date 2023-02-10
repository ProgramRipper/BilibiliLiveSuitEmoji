const eslint = require("eslint")

/** @type {eslint.Linter.Config} **/
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: "standard-with-typescript",
  overrides: [
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: "./tsconfig.json",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "prettier",
  ],
  rules: {
  }
}

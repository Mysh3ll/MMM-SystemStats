module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script",
  },
  ignorePatterns: ["node_modules/", "public/"],
  rules: {
    curly: ["error", "all"],
    eqeqeq: ["error", "always"],
    "no-console": "off",
    "no-var": "error",
    "prefer-const": "warn",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};

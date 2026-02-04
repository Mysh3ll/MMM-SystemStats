const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: ["node_modules/**", "public/**"],
  },
  ...compat.config({
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
    globals: {
      Module: "readonly",
    },
    rules: {
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  }),
];

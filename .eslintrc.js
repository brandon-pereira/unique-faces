module.exports = {
  plugins: ["prettier"],
  extends: ["eslint:recommended"],
  env: {
    es6: true,
    node: true,
  },
  rules: {
    // Load Prettier Config
    "prettier/prettier": "error",
    // Custom rules
    "no-console": 0,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 9,
  },
};

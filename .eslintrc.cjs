module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "unicorn", "sonarjs", "eslint-comments"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:unicorn/recommended",
    "plugin:sonarjs/recommended",
    "plugin:eslint-comments/recommended",
    "prettier",
  ],
  ignorePatterns: [".eslintrc.cjs", "dist"],
}

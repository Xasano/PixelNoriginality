import pluginJs from "@eslint/js";
import globals from "globals";
import prettier from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      prettier: prettier.plugins.prettier,
    },
    languageOptions: { globals: globals.node },
    files: ["**/*.{js,jsx}"],
    rules: { "prettier/prettier": "error" },
  },
  pluginJs.configs.recommended,
];

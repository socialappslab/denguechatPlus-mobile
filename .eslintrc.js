// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    "expo",
    "prettier",
    "eslint-config-prettier",
    "plugin:prettier/recommended",
  ],
  plugins: ["prettier", "@typescript-eslint", "react-hooks"],
  env: {
    jest: true,
  },
  rules: {
    "prettier/prettier": "error",
  },
  ignorePatterns: [
    "assets",
    "*.cjs",
    "metro.config.js",
    "declarations.d.ts",
    "tailwind.config.js",
    "expo-env.d.ts",
  ],
};

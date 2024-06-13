// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  env: {
    jest: true,
  },
  rules: {
    "prettier/prettier": "error",
  },
};

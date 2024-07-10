/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter-Regular", "sans-serif"],
      },
      fontWeight: {
        normal: "400", // Inter-Regular
        medium: "500", // Inter-Medium
        semibold: "600", // Inter-SemiBold
        bold: "700", // Inter-Bold
      },
      colors: {
        primary: "#067507",
        fieldBorder: "#D0D5DD",
      },
    },
  },
  plugins: [],
};

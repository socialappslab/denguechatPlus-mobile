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
        green: {
          [400]: "#D6FFD6"
        },
        sky: {
          [400]: "#344054"
        },
        gray: {
          [400]: "#F9F9F9"
        }
      },
    },
  },
  plugins: [],
};

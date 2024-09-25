/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-yellow",
    "border-yellow",
    "bg-neutral",
    "border-neutral",
    "text-neutral",
    "bg-red-100",
    "bg-red-500",
    "bg-green-300",
    "bg-green-400",
    "border-green-300",
    "border-green-400",
    "border-red-500",
    "border-2",
    "border-3",
    "bg-blue-100",
    "border-blue-400",
    "text-blue-500",
    "bg-yellow-100",
    "bg-yellow-50",
  ],
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
        neutral: "#79716B",
        green: {
          100: "#2FFB2D", // status color
          300: "#EEFFED",
          400: "#D6FFD6",
          500: "#067507",
        },
        sky: {
          400: "#344054",
        },
        gray: {
          300: "#475467",
          400: "#F9F9F9",
        },
        red: {
          100: "#DC143C", // status color
        },
        yellow: {
          50: "#FCC914",
          100: "#FFDE21",
        },
      },
    },
  },
  plugins: [],
};

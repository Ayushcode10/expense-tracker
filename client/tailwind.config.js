/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'DM Serif Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf9",
          100: "#ccfbee",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          800: "#27272a",
          900: "#18181b",
        },
      },
    },
  },
  plugins: [],
};
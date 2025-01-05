/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "boba-cups": ["Boba Cups", "sans-serif"],
        "boba-milky": ["Boba Milky", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    { pattern: /bg-(indigo|emerald|yellow|red|purple|blue)-(900|800|700|600|500|400)/ },
    { pattern: /border-(indigo|emerald|yellow|red|purple|blue)-(800|700|600)/ },
    { pattern: /text-(indigo|emerald|yellow|red|purple|blue)-(400|300)/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

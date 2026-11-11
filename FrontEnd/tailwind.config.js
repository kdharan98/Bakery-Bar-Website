/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#800020',
        cream: '#FFFDD0',
        chocolate: '#7B3F00',
        gold: '#FFD700'
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#8F1F57',
          600: '#7c1d4f',
          700: '#6b1a47',
          800: '#5a173f',
          900: '#4a1437',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#DD388B',
          600: '#c7327d',
          700: '#b12c6f',
          800: '#9b2661',
          900: '#852053',
        },
        accent: {
          50: '#fefcfe',
          100: '#fdf9fc',
          200: '#fbf3f8',
          300: '#f8edf4',
          400: '#f6e7f0',
          500: '#F5DEEA',
          600: '#ddc8d4',
          700: '#c5b2be',
          800: '#ad9ca8',
          900: '#958692',
        },
      },
    },
  },
  plugins: [],
}


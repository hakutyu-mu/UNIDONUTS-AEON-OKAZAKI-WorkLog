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
          DEFAULT: '#95604b',
          light: '#b5806b', // approx lighter
          dark: '#754030', // approx darker
        },
        secondary: {
          DEFAULT: '#dac7a0',
          light: '#fae7c0',
          dark: '#baafa0',
        },
        background: '#fdfcf8', // Warm white
        surface: '#faf8f4', // Slightly darker warm white
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

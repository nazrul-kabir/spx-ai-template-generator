/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spx-blue': '#295aaf',
        'spx-blue-dark': '#2a3641',
        'spx-blue-darkest': '#2a2b33',
        'spx-gray-dark': '#414c5a',
        'spx-gray-light': '#bdc3c7',
        'spx-white': '#ffffff',
        'spx-black': '#000000',
      },
    },
  },
  plugins: [],
}



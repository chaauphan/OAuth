/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-white',
    'text-black',
    'bg-red-500',
    'dark:bg-black',
    'dark:text-white',
    'dark:bg-blue-500',
    // add any other classes you want to guarantee are included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neu: {
          light: '#E0E5EC',
          dark: '#2B2E33',
          'light-text': '#3D4852',
          'dark-text': '#D0D4DA',
          'light-accent': '#6C7A89',
          'dark-accent': '#8A94A3',
        }
      },
      borderRadius: {
        'neu': '20px',
        'neu-sm': '14px',
        'neu-lg': '24px',
        'neu-full': '9999px',
      },
      boxShadow: {
        // We also define full CSS variable-based neumorphic shadows in index.css
      }
    },
  },
  plugins: [],
}

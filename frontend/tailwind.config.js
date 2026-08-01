/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4F46E5',
          purple: '#7C3AED',
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          dark: '#0a0d14',
          panel: '#111726',
          border: '#1e293b',
          accent: '#ff5429',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}

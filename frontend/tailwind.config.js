/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentry: {
          50:  '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#0284c7',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#93c5fd',
          800: '#e0f2fe',
          900: '#ffffff',
          950: '#f0f9ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

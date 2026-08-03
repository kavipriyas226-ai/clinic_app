/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D28D9',
          50: '#F3ECFF',
          100: '#E4D4FF',
          200: '#CBADFE',
          300: '#AB7FFB',
          400: '#8B54F5',
          500: '#6D28D9',
          600: '#5B21B6',
          700: '#4C1D95',
          800: '#3E1774',
          900: '#2E1065',
        },
        bg: '#FAF8FF',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(109, 40, 217, 0.10), 0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        card: '0 4px 16px 0 rgba(109, 40, 217, 0.14)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

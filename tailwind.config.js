/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          50: '#F5F1FF',
          100: '#EDE6FF',
          200: '#DACBFF',
          300: '#C2A8FF',
          400: '#A47EFB',
          500: '#8B5CF6',
          600: '#7440E0',
          700: '#5F30BB',
          800: '#4B2695',
          900: '#3B1D74',
        },
        bg: '#FAF8FF',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(139, 92, 246, 0.08), 0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        card: '0 4px 16px 0 rgba(139, 92, 246, 0.10)',
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

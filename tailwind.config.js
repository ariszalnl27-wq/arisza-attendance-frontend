/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        stone: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        ink: {
          DEFAULT: '#1a1814',
          light: '#2d2a26',
        },
        parchment: {
          DEFAULT: '#f7f4ef',
          dark: '#ede9e0',
        },
        accent: {
          DEFAULT: '#8b6f47',
          light: '#a8895c',
          dark: '#6b5437',
        },
        success: '#4a7c59',
        danger: '#9b3a3a',
        warning: '#8a6d1e',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        'sm': '3px',
        DEFAULT: '5px',
        'md': '7px',
        'lg': '10px',
      },
      keyframes: {
        scanline: {
          '0%, 100%': { top: '0%',   opacity: '1' },
          '50%':      { top: '100%', opacity: '0.6' },
        },
      },
      animation: {
        scanline: 'scanline 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

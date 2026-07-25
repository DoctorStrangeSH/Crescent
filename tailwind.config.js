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
        'crescent': {
          light: '#faf9f6',
          dark: '#0d0d14',
          card: '#ffffff',
          'card-dark': '#16161f',
          accent: '#7c6ff7',
          'accent-light': '#ede9fe',
          'accent-dark': '#2d2454',
          gold: '#f0a860',
          'gold-light': '#fef3e6',
          silver: '#b0b5c0',
          success: '#22c55e',
          'success-light': '#f0fdf4',
          danger: '#ef4444',
          'danger-light': '#fef2f2',
          warning: '#f59e0b',
          'warning-light': '#fffbeb',
          muted: '#787882',
        }
      },
      fontFamily: {
        'title': ['"Plus Jakarta Sans"', 'Comfortaa', 'sans-serif'],
        'body': ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 1px 2px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.2)',
        'card-hover-dark': '0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.3)',
        'modal': '0 0 0 1px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
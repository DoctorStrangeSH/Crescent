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
          accent: '#7c5ce7',
          'accent-light': '#a78bfa',
          gold: '#e8a850',
          'gold-light': '#f0c070',
        },
        'surface': {
          light: '#faf8f5',
          dark: '#0c0c14',
          card: '#ffffff',
          'card-dark': '#161625',
          border: '#e8e5e0',
          'border-dark': '#252535',
          hover: '#f3f0eb',
          'hover-dark': '#1e1e30',
          muted: '#9ca3af',
          'muted-dark': '#6b7280',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'card-hover-dark': '0 4px 16px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
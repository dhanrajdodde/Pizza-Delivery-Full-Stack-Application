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
        charcoal: {
          950: '#07080a',
          900: '#0d0e12',
          850: '#111319',
          800: '#161822',
          700: '#1e2230',
          600: '#2c3144',
          500: '#404760',
        },
        pizza: {
          orange: '#ff6b00',
          'orange-hover': '#ff7d1a',
          'orange-glow': 'rgba(255, 107, 0, 0.4)',
          red: '#e63946',
          'red-glow': 'rgba(230, 57, 70, 0.4)',
          crust: '#d4883b',
          cheese: '#f59e0b',
          cream: '#fcfaf6',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 107, 0, 0.5)',
        'glow-red': '0 0 25px -5px rgba(230, 57, 70, 0.5)',
        'glow-subtle': '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(4deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional audio studio theme
        studio: {
          black: '#0a0a0a',
          'dark-900': '#111111', 
          'dark-800': '#1a1a1a',
          'dark-700': '#262626',
          'dark-600': '#333333',
          'dark-500': '#404040',
          'dark-400': '#525252',
          'dark-300': '#737373',
          'dark-200': '#a3a3a3',
          'dark-100': '#d4d4d4',
          white: '#ffffff',
        },
        // Neon accent colors for audio interfaces
        neon: {
          cyan: '#00ffff',
          'cyan-glow': '#00ffff80',
          green: '#39ff14',
          'green-glow': '#39ff1480',
          orange: '#ff6600',
          'orange-glow': '#ff660080',
          pink: '#ff00ff',
          'pink-glow': '#ff00ff80',
          blue: '#0080ff',
          'blue-glow': '#0080ff80',
          yellow: '#ffff00',
          'yellow-glow': '#ffff0080',
        },
        // Enhanced primary scheme
        primary: {
          50: '#e6f3ff',
          100: '#b3d9ff', 
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#005cb3',
          700: '#004580',
          800: '#002e4d',
          900: '#00171a',
        },
        secondary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        accent: {
          50: '#fef7ff',
          100: '#fce7ff',
          200: '#f8d4fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        'audio': ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
        'futura': ['Futura', 'Trebuchet MS', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neon-pulse': 'neon-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          },
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor',
            opacity: '1'
          },
          '50%': { 
            textShadow: '0 0 2px currentColor, 0 0 5px currentColor',
            opacity: '0.8'
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
        'neon-sm': '0 0 5px currentColor, 0 0 10px currentColor',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
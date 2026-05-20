/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- هاد السطر ضروري جداً
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        sporthink: {
          red: "#E61A21",
          dark: "#050505",
          gray: "#0a0a0a",
        }
      },
      animation: {
        'spin-slow': 'spin 6s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(230, 26, 33, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(230, 26, 33, 0.6)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

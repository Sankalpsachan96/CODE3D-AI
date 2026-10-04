/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        code3d: {
          dark: '#070b14',
          panel: '#0d121f',
          accent: '#00f2fe',
          border: '#1e293b',
          lightBg: '#f8fafc',
          lightPanel: '#ffffff',
          lightBorder: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}


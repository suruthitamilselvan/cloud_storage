/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          bg: '#F9F9F7',
          sidebar: '#F3F3F0',
          card: '#FFFFFF',
          border: '#E5E7EB',
          hover: '#E5E7EB',
          text: '#111827',
          muted: '#6B7280',
        },
        navy: {
          800: '#1e3a8a',
          900: '#1e3a8a',
          button: '#1E3A8A',
          hover: '#172554',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}

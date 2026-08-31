/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2240',
          light: '#1A3355',
          lighter: '#233F6B',
        },
        'op-blue': '#1D4ED8',
        'status-red': '#DC2626',
        'status-amber': '#D97706',
        'status-green': '#16A34A',
        'status-blue': '#2563EB',
        'rail-gray': '#F4F5F7',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', '16px'],
        'sm': ['12px', '18px'],
        'base': ['13px', '20px'],
        'md': ['14px', '20px'],
        'lg': ['15px', '22px'],
        'xl': ['16px', '24px'],
        '2xl': ['18px', '26px'],
        '3xl': ['20px', '28px'],
        '4xl': ['24px', '32px'],
      },
      spacing: {
        'sidebar': '220px',
        'topbar': '52px',
      },
    },
  },
  plugins: [],
}

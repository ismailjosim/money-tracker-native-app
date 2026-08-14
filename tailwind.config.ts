import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // Mid-way vibrant emerald
          start: '#253BCE', // Logo base blue
          mid: '#00A896', // Logo cyan/teal transition
          end: '#84CC16', // Logo top lime green
        },
        background: '#0F1115',
        surface: '#1A1D23',
        muted: '#8E939C',
        brand: {
          bg: '#0B0E14',
          body: '#F5F4F0',
          surface: '#141822',
          'surface-border': '#232838',
          'text-primary': '#F2EFE9',
          'text-secondary': '#8A8D96',
          'text-muted': '#5C5F68',
          // Logo palette map
          blue: '#253BCE', // Deep vibrant indigo/blue
          teal: '#00A896', // Gradient midpoint cyan
          lime: '#84CC16', // Growth arrow green
          coral: '#FF6B4A',
          success: '#84CC16', // Synced with the growth arrow color
        },
      },
    },
  },
  plugins: [],
} satisfies Config

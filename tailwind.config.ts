import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#E2E8F0',
      },
      colors: {
        primary: {
          DEFAULT: '#00E599', // Electric emerald
          light: '#2CEAA6',
          dark: '#00B87A',
          start: '#3B82F6',
          mid: '#00D2B4',
          end: '#00E599',
        },
        background: '#08090D',
        surface: {
          DEFAULT: '#11141F',
          elevated: '#161B2A',
          card: '#131722',
        },
        muted: '#94A3B8',
        brand: {
          bg: '#08090D',
          body: '#08090D',
          surface: '#11141F',
          'surface-card': '#131722',
          'surface-elevated': '#161B2A',
          'surface-border': 'rgba(255, 255, 255, 0.08)',
          'surface-border-subtle': 'rgba(255, 255, 255, 0.04)',
          'text-primary': '#FFFFFF',
          'text-secondary': '#94A3B8',
          'text-muted': '#64748B',
          // Pro FinTech accents
          emerald: '#00E599',
          blue: '#3B82F6',
          indigo: '#6366F1',
          teal: '#00D2B4',
          cyan: '#00D2FF',
          coral: '#FF4D6D',
          amber: '#FBBF24',
          purple: '#A855F7',
          success: '#00E599',
          danger: '#FF4D6D',
        },
      },
    },
  },
  plugins: [],
} satisfies Config

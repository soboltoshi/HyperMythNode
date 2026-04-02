import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        panel: '#10161d',
        line: '#1d2a36',
        accent: '#14f195',
        text: '#e6f1fb',
        muted: '#8ba3b8',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(20,241,149,.2), 0 0 40px rgba(20,241,149,.08)',
      },
    },
  },
  plugins: [],
} satisfies Config

import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts,tsx}',
    './shared/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

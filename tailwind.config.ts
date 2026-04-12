import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './pages/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Source Serif 4', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        'brand-navy': '#1A2B3C',
        'brand-slate': '#4A5568',
        'brand-teal': '#0D6E6E',
        'brand-gold': '#92620A',
        'brand-green': '#1A5C3A',
        'brand-red': '#9B2335',
        'brand-silver': '#EEF2F7',
        'brand-cream': '#FAFAF8',
      },
      maxWidth: {
        content: '1280px',
        prose: '680px',
      },
    },
  },
  plugins: [
    typography,
  ],
} satisfies Config
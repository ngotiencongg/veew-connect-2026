import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#7B2FBE',
          50:  '#F4EBFF',
          100: '#E8D5FF',
          500: '#7B2FBE',
          600: '#6A28A6',
          700: '#5A218E',
        },
        pink: { DEFAULT: '#E91E8C' },
        cyan: { DEFAULT: '#00BCD4' },
        dark: {
          DEFAULT: '#0D0D1A',
          2:  '#1A1A2E',
          card: '#1E1E35',
          card2: '#252545',
        },
        border: '#2E2E50',
        muted: '#9090B8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7B2FBE, #E91E8C)',
      },
    },
  },
  plugins: [],
}
export default config

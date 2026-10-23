import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // "well" kept as the surface scale name; values are now obsidian black.
        well: { 900: '#070504', 800: '#15100a', 700: '#271c0e' },
        gold: { 200: '#fff1b8', 300: '#ffe38a', 400: '#f5c542', 500: '#d4a017', 600: '#9a6f0b' },
        paper: '#fbf7ea',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        title: ['"Cinzel Decorative"', '"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Courier Prime"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gold-foil': 'linear-gradient(115deg, #9a6f0b 0%, #f5c542 22%, #fff1b8 40%, #d4a017 58%, #ffe38a 78%, #9a6f0b 100%)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
        twinkle: { '0%, 100%': { opacity: '0.25' }, '50%': { opacity: '1' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        shimmer: 'shimmer 5s linear infinite',
        twinkle: 'twinkle 3.5s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config

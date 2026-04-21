import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#ffffff',
          2: '#f7f7f7',
          3: '#f0f0f0',
        },
        border: 'rgba(0,0,0,0.09)',
        't1': '#111111',
        't2': '#555555',
        't3': '#999999',
        accent: {
          DEFAULT: '#3ecfb2',
          dim: 'rgba(62,207,178,0.10)',
          glow: 'rgba(62,207,178,0.18)',
        },
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "'Noto Sans'", 'sans-serif'],
        mono: ["'SF Mono'", 'Consolas', 'monospace'],
      },
      typography: (theme: (arg: string) => string) => ({
        DEFAULT: {
          css: {
            color: '#111111',
            a: { color: '#3ecfb2', textDecoration: 'none' },
            'a:hover': { textDecoration: 'underline' },
            code: {
              backgroundColor: '#f0f0f0',
              color: '#3ecfb2',
              borderRadius: '4px',
              padding: '2px 6px',
              fontWeight: '400',
              fontSize: '0.85em',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            'h1,h2,h3,h4': { color: '#111111' },
            blockquote: { borderLeftColor: '#3ecfb2' },
          },
        },
      }),
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'scroll-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'bounce-down': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease forwards',
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
        'scroll-left': 'scroll-left 28s linear infinite',
        'bounce-down': 'bounce-down 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config

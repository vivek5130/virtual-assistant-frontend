/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: token('green'), deep: token('green-deep'), soft: token('green-soft') },
        crimson: { DEFAULT: token('crimson'), soft: token('crimson-soft') },
        orange: { DEFAULT: token('orange'), soft: token('orange-soft') },
        yellow: { DEFAULT: token('yellow'), soft: token('yellow-soft') },
        blue: { DEFAULT: token('blue'), soft: token('blue-soft') },
        cream: token('cream'),
        paper: token('paper'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sticker: '3px 3px 0 0 rgb(var(--ink))',
        'sticker-lg': '6px 6px 0 0 rgb(var(--ink))',
        soft: '0 1px 2px rgb(27 26 23 / 0.06), 0 8px 24px -12px rgb(27 26 23 / 0.18)',
      },
      borderRadius: { blob: '28px' },
    },
  },
  plugins: [],
};

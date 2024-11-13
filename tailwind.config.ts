import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['"Noto Serif"', 'ui-serif', 'Georgia'],
        mono: ['"Source Code Pro"', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [require('daisyui')],
} satisfies Config

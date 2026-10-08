import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        panel: '#131316',
        border: '#2a2a2e',
        text: '#ffffff',
        muted: '#9aa0a6',
        accent: '#00b4d8',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
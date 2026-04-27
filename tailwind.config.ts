import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dungeon Inn Theme
        dungeon: {
          'primary-header': '#2C1E18',
          'secondary-header': '#4A2F22',
          'header-text': '#F0E5D8',
          'sub-header': '#A88C6B',
          'canvas': '#1A1A1A',
          'surface': '#2B2B2B',
          'primary': '#D4CFC6',
          'secondary': '#8A8177',
          'accent': '#E57A00',
          'accent-dark': '#c46a00',
          'outline': '#403A36',
          'dark-text': '#1A110A',
          'muted': '#5A544E',
          'star-empty': '#454545',
          'star-half': '#5a5a5a',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'dungeon': ['var(--font-cinzel)', 'Georgia', 'serif'],
        'body': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        shimmer: 'shimmer 1.2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
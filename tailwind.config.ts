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
          'outline': '#403A36',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'dungeon': ['Cinzel', 'Georgia', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
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
        'oge-orange': '#C45C1A',
        'oge-deep': '#8B3A0E',
        'oge-tint': '#F5E6D3',
        'oja-green': '#2E6B4F',
        'oja-green-light': '#EAF3E7',
        'oja-gold': '#D4A017',
        'oja-gold-light': '#FDF7E8',
        'oja-red': '#8C1C1C',
        'oja-red-light': '#F9EDED',
        'bark': '#1A1410',
        'bark-mid': '#5C4A3A',
        'bark-light': '#A08878',
        'harmattan': '#F2EDE8',
        'border': '#D4C0A8',
      },
    },
  },
  plugins: [],
};
export default config;

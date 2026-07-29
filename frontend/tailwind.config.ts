import type { Config } from "tailwindcss";

// Design tokens for the "Wayfarer" travel-journal aesthetic:
// a warm paper ground, ink-navy text, and a brass/moss accent pair
// evoking passport stamps and vintage route maps (not the default
// cream+terracotta or dark+neon look).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F6F0DE",
        ink: "#1B2A3A",
        "ink-soft": "#3A4A5C",
        brass: "#B8863B",
        "brass-dark": "#8F6726",
        moss: "#4C6B54",
        rust: "#A6472E",
        line: "#D9CFB3",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "stamp-ring": "repeating-conic-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;

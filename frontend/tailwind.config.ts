import type { Config } from "tailwindcss";

const config: Config = {
  // Toggle dark/light via class on <html>
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        // CSS-variable driven — supports opacity modifiers (bg-mega-bg/80 etc.)
        mega: {
          bg:      "rgb(var(--mega-bg)      / <alpha-value>)",
          surface: "rgb(var(--mega-surface)  / <alpha-value>)",
          border:  "rgb(var(--mega-border)   / <alpha-value>)",
          text:    "rgb(var(--mega-text)     / <alpha-value>)",
          muted:   "rgb(var(--mega-muted)    / <alpha-value>)",
          coral:   "rgb(var(--mega-coral)    / <alpha-value>)",
          peach:   "rgb(var(--mega-peach)    / <alpha-value>)",
          mint:    "rgb(var(--mega-mint)     / <alpha-value>)",
          cyan:    "rgb(var(--mega-cyan)     / <alpha-value>)",
          // Fixed accent colours (same in both modes)
          rose:     "#FF8AA8",
          lavender: "#F786C6",
          teal:     "#6DD0A9",
          sky:      "#7EAAD4",
        },
      },

      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        sans: ["'Helvetica Neue'", "Helvetica", "Arial", "sans-serif"],
      },

      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "glow-coral": "glowCoral 2s ease-in-out infinite alternate",
        "glow-mint":  "glowMint  2s ease-in-out infinite alternate",
        "ticker":     "ticker 0.2s ease-out forwards",
      },

      keyframes: {
        fadeIn:    { from: { opacity: "0" },                              to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        glowCoral: { from: { boxShadow: "0 0 8px #F5949D44" },            to: { boxShadow: "0 0 24px #F5949D88" } },
        glowMint:  { from: { boxShadow: "0 0 8px #90D79F44" },            to: { boxShadow: "0 0 24px #90D79F88" } },
        ticker:    { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },

  plugins: [],
};

export default config;

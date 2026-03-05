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
        // MegaETH Brand Palette
        mega: {
          bg:      "#19191A",   // Night Sky
          surface: "#222224",   // slightly lighter surface
          border:  "#2E2E30",   // subtle borders
          text:    "#ECE8E8",   // Moon White
          muted:   "#888888",   // muted text
          coral:   "#F5949D",   // Coral (DOWN / loss)
          peach:   "#F5AF94",   // Peach
          rose:    "#FF8AA8",   // Rose
          lavender:"#F786C6",   // Lavender Pink
          mint:    "#90D79F",   // Mint (UP / win)
          teal:    "#6DD0A9",   // Teal
          sky:     "#7EAAD4",   // Sky Blue
          cyan:    "#70BAD2",   // Cyan
        },
      },
      fontFamily: {
        mono:  ["'Courier New'", "Courier", "monospace"],
        sans:  ["'Helvetica Neue'", "Helvetica", "Arial", "sans-serif"],
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":     "fadeIn 0.4s ease forwards",
        "slide-up":    "slideUp 0.4s ease forwards",
        "glow-coral":  "glowCoral 2s ease-in-out infinite alternate",
        "glow-mint":   "glowMint 2s ease-in-out infinite alternate",
        "ticker":      "ticker 0.2s ease-out forwards",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" },                   to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        glowCoral: { from: { boxShadow: "0 0 8px #F5949D44" }, to: { boxShadow: "0 0 24px #F5949D88" } },
        glowMint:  { from: { boxShadow: "0 0 8px #90D79F44" }, to: { boxShadow: "0 0 24px #90D79F88" } },
        ticker:    { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-sm": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;

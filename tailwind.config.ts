import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f1419",
        "bg-deep": "#0a0f14",
        "surface-mid": "#131820",
        panel: "#171d24",
        "panel-light": "#171d24",
        panelMuted: "#1e2730",
        accent: "#f5c451",
        "accent-secondary": "#b22234",
        "accent-warm": "#ff8c42",
        text: "#e5edf5",
        "text-secondary": "#a8b8c7",
        subtle: "#8b9cad",
        danger: "#ff5d6c"
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "var(--shadow-glow)",
        "glow-strong": "var(--shadow-glow-strong)"
      },
      animation: {
        "fade-in": "fadeIn var(--duration-base) var(--ease-out) forwards",
        "slide-up": "slideInUp var(--duration-base) var(--ease-out) forwards",
        "slide-down": "slideInDown var(--duration-base) var(--ease-out) forwards",
        "slide-left": "slideInLeft var(--duration-base) var(--ease-out) forwards",
        "slide-right": "slideInRight var(--duration-base) var(--ease-out) forwards",
        "scale-in": "scaleIn var(--duration-base) var(--ease-out) forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "hover-lift": "hoverLift var(--duration-base) var(--ease-bounce) forwards"
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)"
      },
      transitionTimingFunction: {
        "ease-in": "var(--ease-in)",
        "ease-out": "var(--ease-out)",
        "ease-in-out": "var(--ease-in-out)",
        bounce: "var(--ease-bounce)"
      }
    }
  },
  plugins: []
};

export default config;

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
        panel: "#171d24",
        panelMuted: "#1e2730",
        accent: "#44b3ff",
        text: "#e5edf5",
        subtle: "#8b9cad",
        danger: "#ff5d6c"
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;

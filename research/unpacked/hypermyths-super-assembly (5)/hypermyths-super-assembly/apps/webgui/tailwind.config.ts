import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#121722",
        line: "#273045",
        text: "#eef2ff",
        muted: "#8d9ab7",
        accent: "#6ee7b7",
        accent2: "#f59e0b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(110,231,183,0.12), 0 12px 30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;

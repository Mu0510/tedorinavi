import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        md: "768px",
        lg: "1024px",
        xl: "1280px"
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1.5rem",
          md: "2rem"
        }
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        }
      },
      animation: {
        "fade-in": "fade-in 200ms ease-in-out"
      }
    }
  }
};

export default config;

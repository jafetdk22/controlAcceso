import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f4f6fb",
          100: "#e7ecf6",
          200: "#cad6ec",
          300: "#9cb3dc",
          400: "#6889c8",
          500: "#4567b2",
          600: "#345196",
          700: "#2c427a",
          800: "#293a66",
          900: "#101a33",
          950: "#0a1224"
        },
        accent: {
          400: "#f5b454",
          500: "#e09a32",
          600: "#b87a22"
        },
        ink: {
          DEFAULT: "#0b1020",
          muted: "#5b6478"
        }
      },
      boxShadow: {
        card: "0 12px 40px -12px rgba(15, 23, 42, 0.18)",
        soft: "0 8px 30px -10px rgba(15, 23, 42, 0.12)",
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px -12px rgba(69, 103, 178, 0.45)"
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(1200px 600px at 50% -200px, rgba(69,103,178,0.18), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(224,154,50,0.12), transparent 60%)"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "rise": "rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        rise: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./prisma/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#F8F7FF",
          900: "#FFFFFF",
          850: "#F3F1FD",
          800: "#EBE8FA",
          700: "#DDD8F1"
        },
        accent: {
          DEFAULT: "#2E0988",
          hover: "#24066E",
          light: "#2E0988",
          muted: "#E9E2FF"
        },
        teal: {
          DEFAULT: "#2E0988",
          light: "#2E0988",
          dim: "#24066E"
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "#b9827a"
        },
        warn: {
          DEFAULT: "#f59e0b",
          muted: "#c7b079"
        },
        line: "rgba(46,9,136,0.08)"
      },
      fontFamily: {
        sans: ["var(--font-pjs)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        bezel: "inset 0 1px 1px rgba(255,255,255,0.14), 0 30px 80px -45px rgba(0,0,0,0.75)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 50px -20px rgba(0,0,0,0.5)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    }
  },
  plugins: []
};

export default config;

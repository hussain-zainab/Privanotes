/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens — see docs/DESIGN.md for rationale.
        ink: {
          950: "#0B0E13",
          900: "#10141A",
          800: "#171D26",
          700: "#1E2530",
          600: "#262E3A",
          500: "#3A4454",
        },
        mist: {
          400: "#5C6577",
          300: "#8B93A1",
          200: "#B7BDC7",
          100: "#E7EAEE",
        },
        shield: {
          DEFAULT: "#35C48C",
          soft: "#1E3B30",
        },
        live: {
          DEFAULT: "#E2A63D",
          soft: "#3B301A",
        },
        alert: {
          DEFAULT: "#E2574C",
          soft: "#3A211E",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

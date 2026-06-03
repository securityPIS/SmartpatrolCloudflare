/**
 * Shared Tailwind preset for SmartPatrol apps.
 * Apps consume it via: presets: [require("@smartpatrol/config/tailwind-preset")]
 *
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // SmartPatrol identity is cyan-on-navy. `brand` is mapped onto the
        // Tailwind cyan ramp so existing `brand-*` classes inherit the look.
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        // Core navy surfaces lifted from the legacy SmartPatrol palette.
        navy: {
          900: "#070b19",
          950: "#020617",
          surface: "#0b1229",
        },
      },
      fontFamily: {
        sans: [
          "Chakra Petch",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "sos-flash": {
          "0%, 100%": { backgroundColor: "rgba(69, 10, 10, 0.9)" },
          "50%": { backgroundColor: "rgba(127, 29, 29, 0.95)" },
        },
        "scale-up-center": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "sos-flash": "sos-flash 1s ease-in-out infinite",
        "scale-up-center": "scale-up-center 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [],
};

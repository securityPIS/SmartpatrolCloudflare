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
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcdaff",
          300: "#8ec2ff",
          400: "#599fff",
          500: "#327bff",
          600: "#1b5cf5",
          700: "#1647e1",
          800: "#193bb6",
          900: "#1a378f",
          950: "#152357",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

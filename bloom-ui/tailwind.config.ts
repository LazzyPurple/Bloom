import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bloom: {
          50: "#f4f0ff",
          100: "#e7ddff",
          200: "#d2c0ff",
          300: "#b395ff",
          400: "#9168fb",
          500: "#6c3ce1",
          600: "#582dbb",
          700: "#442393",
          800: "#31196a",
          900: "#22114a"
        }
      }
    }
  },
  plugins: [],
} satisfies Config;

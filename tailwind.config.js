/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#d97706",
        "brand-light": "#f59e0b",
        base: "#0c0c0e",
        surface: "#16161a",
        sidebar: "#111114",
        "text-primary": "#f5f2ec",
        "text-secondary": "#d1cfc8",
        "text-muted": "#9ca3af",
        "text-dim": "#6b7280",
        "text-faint": "#4b5563",
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
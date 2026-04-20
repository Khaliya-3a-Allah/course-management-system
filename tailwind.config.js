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
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        sidebar: "var(--color-sidebar)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-dim": "var(--color-text-dim)",
        "text-faint": "var(--color-text-faint)",
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink:          "rgb(var(--color-ink) / <alpha-value>)",
        paper:        "rgb(var(--color-paper) / <alpha-value>)",
        paperDim:     "rgb(var(--color-paper-dim) / <alpha-value>)",
        oxblood:      "rgb(var(--color-oxblood) / <alpha-value>)",
        oxbloodDark:  "rgb(var(--color-oxblood-dark) / <alpha-value>)",
        sage:         "rgb(var(--color-sage) / <alpha-value>)",
        brass:        "rgb(var(--color-brass) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body:    ["'Inter'",    "sans-serif"],
        mono:    ["'IBM Plex Mono'", "monospace"],
      },
      scale: {
        108: "1.08",
      },
      transitionProperty: {
        "max-height": "max-height",
      },
    },
  },
  plugins: [],
};

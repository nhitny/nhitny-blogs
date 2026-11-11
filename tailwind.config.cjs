/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const typography = require("@tailwindcss/typography");

// "Soft Tech" palette — shared with nhitny.github.io.
// `indigo` and `gray` are remapped so every existing page (admin included)
// automatically picks up the lavender + plum-neutral look.
const lavender = {
  50: "#f6f2ff",
  100: "#ede6ff",
  200: "#ddd0ff",
  300: "#c4b5fd",
  400: "#a98bfa",
  500: "#8b5cf6",
  600: "#7a4be6",
  700: "#683dcc",
  800: "#5532a6",
  900: "#3d2580",
  950: "#251651",
};

const plum = {
  50: "#faf7f5",
  100: "#f4eff2",
  200: "#e9e1ec",
  300: "#d4cbd9",
  400: "#a99fb8",
  500: "#857b95",
  600: "#6f6680",
  700: "#4b4358",
  800: "#2a2433",
  900: "#1a1523",
  950: "#0d0b14",
};

const rose = {
  50: "#fff1f6",
  100: "#ffe3ed",
  200: "#ffc8dc",
  300: "#ff9fc6",
  400: "#f585b1",
  500: "#e7779f",
  600: "#d0567f",
  700: "#ae3f66",
  800: "#8e3555",
  900: "#76304b",
  950: "#461627",
};

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./Lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: lavender,
        gray: plum,
        lavender,
        plum,
        rose,
        sage: { 300: "#a7e6d2", 400: "#7ee3c9", 500: "#3fa58f" },
        st: {
          bg: "var(--st-bg)",
          surface: "var(--st-surface)",
          ink: "var(--st-ink)",
          muted: "var(--st-muted)",
          line: "var(--st-line)",
          accent: "var(--st-accent)",
          rose: "var(--st-accent-2)",
          sage: "var(--st-accent-3)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-serif)", "Georgia", ...defaultTheme.fontFamily.serif],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        st: "22px",
      },
      boxShadow: {
        2: "0 1px 3px 0 rgb(11 17 29 / 98%), 0 1px 2px 0 rgb(9 18 35 / 90%)",
        st: "var(--st-shadow)",
        "st-hover": "var(--st-shadow-hover)",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.plum.700"),
            a: {
              color: theme("colors.lavender.600"),
              textDecoration: "underline",
              textDecorationColor: theme("colors.lavender.300"),
              textUnderlineOffset: "3px",
              "&:hover": { color: theme("colors.rose.600") },
              code: { color: theme("colors.lavender.600") },
            },
            "h1,h2,h3,h4": {
              fontFamily: "var(--font-serif), Georgia, serif",
              fontWeight: "600",
              color: theme("colors.plum.900"),
              letterSpacing: "-0.01em",
            },
            "h2,h3,h4": { "scroll-margin-top": defaultTheme.spacing[24] },
            strong: { color: theme("colors.plum.900") },
            code: {
              color: theme("colors.rose.600"),
              fontFamily: "var(--font-mono), monospace",
            },
            blockquote: {
              fontFamily: "var(--font-serif), Georgia, serif",
              fontStyle: "italic",
              borderLeftColor: theme("colors.lavender.400"),
              color: theme("colors.plum.700"),
            },
            "ul > li::marker": { color: theme("colors.rose.500") },
            "ol > li::marker": { color: theme("colors.lavender.500") },
            hr: { borderColor: theme("colors.plum.200") },
            "thead th": { color: theme("colors.plum.900") },
          },
        },
        invert: {
          css: {
            color: theme("colors.plum.300"),
            a: {
              color: theme("colors.lavender.300"),
              textDecorationColor: theme("colors.lavender.700"),
              "&:hover": { color: theme("colors.rose.300") },
              code: { color: theme("colors.lavender.300") },
            },
            "h1,h2,h3,h4,h5,h6": { color: "#f5f1fb" },
            strong: { color: "#f5f1fb" },
            code: { color: theme("colors.rose.300") },
            blockquote: {
              color: theme("colors.plum.200"),
              borderLeftColor: theme("colors.lavender.400"),
            },
            "ul > li::marker": { color: theme("colors.rose.300") },
            "ol > li::marker": { color: theme("colors.lavender.300") },
            hr: { borderColor: "rgba(255,255,255,0.08)" },
            "thead th": { color: "#f5f1fb" },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

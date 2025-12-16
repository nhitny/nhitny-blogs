/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const typography = require("@tailwindcss/typography");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./Lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css}"
  ],
  theme: {
    extend: {
      boxShadow: {
        2: "0 1px 3px 0 rgb(11 17 29 / 98%), 0 1px 2px 0 rgb(9 18 35 / 90%)",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
            a: {
              color: theme("colors.blue.500"),
              "&:hover": { color: theme("colors.blue.700") },
              code: { color: theme("colors.blue.400") },
            },
            "h2,h3,h4": { "scroll-margin-top": defaultTheme.spacing[32] },
            code: { color: theme("colors.pink.500") },
            "blockquote p:first-of-type::before": false,
            "blockquote p:last-of-type::after": false,
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.blue.400"),
              "&:hover": { color: theme("colors.blue.600") },
              code: { color: theme("colors.blue.400") },
            },
            blockquote: {
              borderLeftColor: theme("colors.gray.700"),
              color: theme("colors.gray.300"),
            },
            "h2,h3,h4": {
              color: theme("colors.gray.100"),
              "scroll-margin-top": defaultTheme.spacing[32],
            },
            hr: { borderColor: theme("colors.gray.700") },
            ol: { li: { "&:before": { color: theme("colors.gray.500") } } },
            ul: { li: { "&:before": { backgroundColor: theme("colors.gray.500") } } },
            strong: { color: theme("colors.gray.300") },
            thead: { color: theme("colors.gray.100") },
            tbody: { tr: { borderBottomColor: theme("colors.gray.700") } },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

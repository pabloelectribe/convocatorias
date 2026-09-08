import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff8f4",
          100: "#d7efe3",
          200: "#b0dfc7",
          300: "#7ec9a6",
          400: "#4bab81",
          500: "#2c8f66",
          600: "#1f7252",
          700: "#1a5c43",
          800: "#174a37",
          900: "#133c2d",
        },
      },
    },
  },
  plugins: [],
};
export default config;

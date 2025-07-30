import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        geistSans: ["var(--font-geist-sans)"],
      },
      keyframes: {
        "fade-effect": {
          "0%": {
            transform: "scale(0.9)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "slide-up": {
          "0%": {
            transform: "translateY(100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slide-down": {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        loader: {
          "0%": {
            opacity: "0.2",
          },
          "100%": {
            opacity: "1",
          },
        },
        spin: {},
      },
      animation: {
        "fade-in": "fade-effect 300ms linear",
        "slide-down": "slide-down 300ms linear forwards",
        "slide-up": "slide-up 300ms linear forwards",
        "rotate-clockwise": "rotate-clockwise 1s infinite linear",
        "loader-opacity": "loader 1s ease-in-out alternate infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      colors: {
        primary: {
          DEFAULT: "#2A9D8F", // Teal Green
          50: "#E6F4F2",
          100: "#1A7A6F",
          200: "#2A9D8F",
          300: "#3BB8A8",
          400: "#4CD3C1",
          500: "#5EEEDA",
          dark: "#1A7A6F", // Darker version for dark mode
        },
        secondary: {
          DEFAULT: "#E9C46A", // Warm Yellow/Gold
          50: "#FDF8E8",
          100: "#D4B55A",
          200: "#E9C46A",
          300: "#F4D17A",
          400: "#FFDE8A",
          500: "#FFEB9A",
          dark: "#C4A65A", // Darker version for dark mode
        },
        accent: {
          DEFAULT: "#F4A261", // Soft Orange
          50: "#FEF2EA",
          100: "#E89451",
          200: "#F4A261",
          300: "#FFB071",
          400: "#FFBD81",
          500: "#FFCA91",
          dark: "#E89451", // Darker version for dark mode
        },
        dark: {
          DEFAULT: "#1A1D1F", // Near black for dark mode
          50: "#252A2E",
          100: "#1E2224",
          200: "#1A1D1F",
          300: "#16181A",
          400: "#111315",
          500: "#0D0E10",
          surface: "#252A2E", // For cards and elevated surfaces
          border: "#2E3438", // For borders in dark mode
        },
        light: {
          DEFAULT: "#F1FAEE", // Soft Off-White
          50: "#FFFFFF",
          100: "#E8F5E5",
          200: "#F1FAEE",
          300: "#FAFFFD",
          400: "#FFFFFF",
          500: "#FFFFFF",
          surface: "#FFFFFF", // For cards and elevated surfaces
          border: "#E8F5E5", // For borders in light mode
        },
        text: {
          DEFAULT: "#333333", // Default body text
          50: "#666666",
          100: "#555555",
          200: "#444444",
          300: "#333333",
          400: "#222222",
          500: "#111111",
          light: "#F8FAFC", // Light text for dark mode
          muted: "#94A3B8", // Muted text for both modes
        },
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // if you are using variable and want to use more than one fonts for your webapp,you could define it here. like i did
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
          100: "#1A7A6F",
          200: "#2A9D8F",
          300: "#3BB8A8",
        },
        secondary: {
          DEFAULT: "#E9C46A", // Warm Yellow/Gold
          100: "#D4B55A",
          200: "#E9C46A",
          300: "#F4D17A",
        },
        accent: {
          DEFAULT: "#F4A261", // Soft Orange
          100: "#E89451",
          200: "#F4A261",
          300: "#FFB071",
        },
        dark: {
          DEFAULT: "#264653", // Deep Blue-Green
          100: "#1A3741",
          200: "#264653",
          300: "#325565",
        },
        light: {
          DEFAULT: "#F1FAEE", // Soft Off-White
          100: "#E8F5E5",
          200: "#F1FAEE",
          300: "#FAFFFD",
        },
        text: {
          DEFAULT: "#333333", // Default body text
          secondary: "#555555", // Secondary text
        },
      },
    },
  },
  plugins: [],
};
export default config;

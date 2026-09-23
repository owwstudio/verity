import type { Config } from "tailwindcss";
import fluid, { extract, screens, fontSize } from "fluid-tailwind";
import reset from "tw-reset";

export default {
  presets: [reset],
  content: { files: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], extract },
  theme: {
    screens, // Tailwind's default screens, in `rem`
    fontSize, // Tailwind's default font sizes, in `rem` (including line heights)
    extend: {
      fontFamily: {
        sans: ["Arial", "sans-serif"],
        serif: ["Georgia", "serif"],
        maru: ['"GT Maru"', "Arial", "sans-serif"],
      },
      colors: {
        "brand-blue": "#00A7F2",
        "brand-blue-light": "#80D3F8",
        "brand-blue-extra-light": "#B8E8FC",
        "brand-blue-hover": "#275A80",
        "brand-navy": "#0D1E30",
        "brand-navy-dark": "#061F32",
        "brand-gold": "#F8BC3B",
      },
      dropShadow: {
        white: "0 2px 4px rgba(255, 255, 255, 0.5)",
        "white-lg": "0 4px 8px rgba(255, 255, 255, 0.6)",
      },
      height: {
        screen: "100svh",
      },
      backdropBlur: {
        md: "12px",
      },
      keyframes: {
        clouds: {
          "0%": {
            opacity: "0",
            transform: "scale(1)",
          },
          "25%, 75%": {
            opacity: "1",
          },
          "100%": {
            transform: "scale(3)",
            opacity: "0",
          },
        },
      },
      animation: {
        clouds: "clouds calc(6s * var(--i)) ease-in infinite",
      },
    },
  },
  plugins: [
    fluid({
      checkSC144: false,
    }),
  ],
} satisfies Config;

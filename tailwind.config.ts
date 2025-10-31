import type { Config } from "tailwindcss";

const config: Config & { daisyui?: any } = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        "tech-ofrenda": {
          "primary": "#f97316",     // Orange for Day of the Dead
          "secondary": "#dc2626",   // Red for Day of the Dead
          "accent": "#fbbf24",      // Gold/Yellow
          "neutral": "#374151",     // Dark gray
          "base-100": "#ffffff",    // White background
          "base-200": "#f9fafb",    // Light gray
          "base-300": "#f3f4f6",    // Lighter gray
          "info": "#3b82f6",        // Blue
          "success": "#10b981",     // Green
          "warning": "#f59e0b",     // Amber
          "error": "#ef4444",       // Red
        },
      },
      "dark",
      "light",
    ],
  },
};

export default config;
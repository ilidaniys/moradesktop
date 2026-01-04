import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors (no hsl() wrapper - using OKLch)
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Typography colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },

        // Primary (Indigo)
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          soft: "var(--primary-soft)",
          hover: "var(--primary-hover)",
          border: "var(--primary-border)",
        },

        // Secondary (Teal)
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          soft: "var(--secondary-soft)",
          hover: "var(--secondary-hover)",
          border: "var(--secondary-border)",
        },

        // Status colors
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
          border: "var(--success-border)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
          border: "var(--warning-border)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
          border: "var(--danger-border)",
        },

        // Destructive (alias for danger)
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        // Muted
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // Accent
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        // Popover
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // Card
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius-sm)",  // 10px for buttons/inputs
        xl: "var(--radius-md)",  // 12px for cards/dialogs
        "2xl": "var(--radius-lg)", // 16px for large containers
      },
      spacing: {
        unit: "var(--spacing-unit)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        md: "var(--text-md)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        card: "var(--shadow-card)",
        dropdown: "var(--shadow-dropdown)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;

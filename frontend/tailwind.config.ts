import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ─── Kaster.uz Rang Palitrasi ─────────────────────────────
      colors: {
        // Asosiy brend ranglar
        // charcoal — matn rangi. CSS o'zgaruvchidan keladi, .app-dark ichida yorug'ga aylanadi.
        charcoal: {
          DEFAULT: "rgb(var(--charcoal-800) / <alpha-value>)",
          50:  "rgb(var(--charcoal-50) / <alpha-value>)",
          100: "rgb(var(--charcoal-100) / <alpha-value>)",
          200: "rgb(var(--charcoal-200) / <alpha-value>)",
          300: "rgb(var(--charcoal-300) / <alpha-value>)",
          400: "rgb(var(--charcoal-400) / <alpha-value>)",
          500: "rgb(var(--charcoal-500) / <alpha-value>)",
          600: "rgb(var(--charcoal-600) / <alpha-value>)",
          700: "rgb(var(--charcoal-700) / <alpha-value>)",
          800: "rgb(var(--charcoal-800) / <alpha-value>)",
          900: "rgb(var(--charcoal-900) / <alpha-value>)",
        },
        cream: {
          DEFAULT: "#FAF8F4",
          50:  "#FDFCFA",
          100: "#FAF8F4",
          200: "#F0ECE3",
          300: "#E0D8C9",
          400: "#CCC0A8",
          500: "#B8A487",
        },
        // Brend urg'u rangi — mavzu (theme) orqali CSS o'zgaruvchidan keladi.
        // Barcha `gold-*` klasslar avtomatik tanlangan mavzuga bo'ysunadi.
        gold: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          50:  "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
        },
        // shadcn/ui design tokens
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // ─── Tipografika (iOS — SF Pro / system) ─────────────────
      fontFamily: {
        serif:  ["Playfair Display", "Fraunces", "Georgia", "serif"],
        sans:   ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "Manrope", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
        wider:  "0.12em",
      },
      // ─── Border radius (iOS — yumshoq, katta) ────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
        ios: "0.6rem",       // ~10px — klassik editorial
        "ios-lg": "0.85rem", // ~14px — klassik editorial
      },
      // ─── iOS floating soyalar ────────────────────────────────
      boxShadow: {
        glass:      "0 8px 32px rgba(17,17,17,0.10)",
        "glass-sm": "0 4px 16px rgba(17,17,17,0.07)",
        float:      "0 16px 48px rgba(17,17,17,0.16)",
        "ios-nav":  "0 8px 30px rgba(0,0,0,0.10)",
        "ios-tab":  "0 -2px 20px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.10)",
      },
      // ─── Animatsiyalar ───────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to:   { transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%":      { transform: "translateY(-18px) scale(1.04)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in":         "fade-in 0.3s ease-out",
        "slide-in-right":  "slide-in-right 0.3s ease-out",
        "scale-in":        "scale-in 0.25s cubic-bezier(0.22,1,0.36,1)",
        "sheet-up":        "sheet-up 0.35s cubic-bezier(0.22,1,0.36,1)",
        "float-slow":      "float-slow 9s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

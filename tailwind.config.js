/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Caminho necessário para componentes do Tremor
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}', 
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Cores mapeadas para o Tremor usar as variáveis do tema
        tremor: {
          brand: {
            faint: "#eff6ff", 
            muted: "#bfdbfe", 
            subtle: "#60a5fa", 
            DEFAULT: "#3b82f6", 
            emphasis: "#1d4ed8", 
            inverted: "#ffffff", 
          },
          background: {
            muted: "#f9fafb", 
            subtle: "#f3f4f6", 
            DEFAULT: "hsl(var(--background))",
            emphasis: "#374151", 
          },
          border: {
            DEFAULT: "hsl(var(--border))",
          },
          ring: {
            DEFAULT: "hsl(var(--ring))",
          },
          content: {
            subtle: "#9ca3af", 
            DEFAULT: "hsl(var(--foreground))",
            emphasis: "#374151", 
            strong: "#111827", 
            inverted: "#ffffff", 
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
				neon: {
					green: "#00FF6A",
					purple: "#7D00FF",
					pink: "#FF00AA",
					blue: "#00FFFF",
					yellow: "#FFFF00",
				},
				gray: {
					dark: "#1B1B1F",
					light: "#B3B3B3",
					silver: "#535353",
				},
				electric: {
					DEFAULT: "#1e1b4a",
					light: "#9E4DFF",
					dark: "#1e1b4a",
				},
				shock: {
					DEFAULT: "#a32166",
					light: "#D42A85",
					dark: "#7A1849",
				},
				deep: {
					DEFAULT: "#0D0D0D",
					blue: "#000033",
					purple: "#1e1b4a",
				},
				white: {
					DEFAULT: "#F0F0F5",
					pure: "#FFFFFF",
				},
				boxShadow: {
					neon: "0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14, 0 0 20px #39FF14",
				},
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
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				glow: {
					"0%": { boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)" },
					"50%": { boxShadow: "0 0 40px rgba(0, 255, 255, 0.2)" },
					"100%": { boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)" },
				},
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
				pulse: {
					"0%, 100%": { opacity: 1 },
					"50%": { opacity: 0.5 },
				},
				shimmer: {
					"0%": { backgroundPosition: "-1000px 0" },
					"100%": { backgroundPosition: "1000px 0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				shimmer: "shimmer 2s linear infinite",
				glow: "glow 3s infinite", // Movido para dentro do objeto animation
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};

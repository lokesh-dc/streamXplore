/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./modal/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: ["class", '[data-theme="dark"]'],
	content: [
		"./app/**/*.{ts,tsx}",
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
	],
	safelist: [
		{
			pattern: /glass(-sm|-md|-lg)?/,
		},
	],
	theme: {
		extend: {
			colors: {
				bg: {
					main: "var(--bg-main)",
					secondary: "var(--bg-secondary)",
				},
				text: {
					primary: "var(--text-primary)",
					secondary: "var(--text-secondary)",
				},
				glass: {
					bg: "var(--glass-bg)",
					border: "var(--glass-border)",
				},
			},
			borderRadius: {
				sm: "var(--radius-sm)",
				md: "var(--radius-md)",
				lg: "var(--radius-lg)",
			},
			boxShadow: {
				glass: "var(--shadow-glass)",
			},
			backdropBlur: {
				sm: "var(--blur-sm)",
				md: "var(--blur-md)",
				lg: "var(--blur-lg)",
			},
			transitionTimingFunction: {
				smooth: "var(--ease)",
			},
		},
	},
	plugins: [],
};

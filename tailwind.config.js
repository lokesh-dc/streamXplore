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
		fontSize: {
			sm: ["0.8125rem", { lineHeight: "1.2rem" }],
			base: ["0.9375rem", { lineHeight: "1.5rem" }],
			lg: ["1.0625rem", { lineHeight: "1.6rem" }],
			"3xl": ["3rem", { lineHeight: "3.5rem" }],
		},
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
			fontSize: {
				"ui-xs": ["0.6875rem", { lineHeight: "1rem" }],
				"ui-sm": ["0.75rem", { lineHeight: "1.1rem" }],
				"ui-md": ["0.8125rem", { lineHeight: "1.2rem" }],

				"title-sm": ["1.125rem", { lineHeight: "1.5rem" }],
				"title-md": ["1.25rem", { lineHeight: "1.6rem" }],
				"title-lg": ["1.5rem", { lineHeight: "1.9rem" }],
				"title-xl": ["1.875rem", { lineHeight: "2.2rem" }],

				"hero-sm": ["2.25rem", { lineHeight: "2.6rem" }],
				"hero-md": ["3rem", { lineHeight: "3.4rem" }],
				"hero-lg": ["3.75rem", { lineHeight: "4rem" }],
			},
		},
	},
	plugins: [],
};

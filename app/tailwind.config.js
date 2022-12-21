/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
	purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	content: [],
	theme: {
		extend: {},
		colors: {
			"sol-green": "#14F195",
			"sol-green-stronger": "#00C069",
			"sol-purple": "#9945FF",
			"sol-purple-soft": "#B761FF",
			gray: colors.stone,
			white: "#ffffff",
			black: {
				// 100: '#cffafe',
				// 200: '#a5f3fc',
				// 300: '#67e8f9',
				// 400: '#22d3ee',
				500: "#262626",
				600: "#1B1B1B",
				700: "#101010",
				800: "#0A0A0A",
				900: "#000000",
			},
		},
	},
	plugins: [],
};

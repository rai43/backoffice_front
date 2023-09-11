/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js}', './node_modules/react-tailwindcss-datepicker/dist/index.esm.js'],
	darkMode: ['class', '[data-theme="dark"]'],
	theme: {
		extend: {},
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
};

// /** @type {import('tailwindcss').Config} */
// module.exports = {
// 	content: ['./src/**/*.{html,js}', './node_modules/react-tailwindcss-datepicker/dist/index.esm.js'],
// 	darkMode: ['class', '[data-theme="dark"]'],
// 	theme: {
// 		extend: {},
// 	},
// 	plugins: [require('daisyui'), require('@tailwindcss/typography'), require('@tailwindcss/forms')],
// 	// daisyui: {
// 	// 	themes: ['light', 'dark', 'corporate', 'retro'],
// 	// },
// };

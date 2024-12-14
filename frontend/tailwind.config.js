/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",], theme: {
        extend: {},
    }, plugins: [
        require('@tailwindcss/typography'),
        require("daisyui"),
        function ({ addVariant }) {
            addVariant('parent-not-prose', '&:not(has(.not-prose))');
        },
    ],

    experimental: {
        optimizeUniversalDefaults: true
    }, daisyui: {
        themes: ["light", "dark"
        ],
    },
}


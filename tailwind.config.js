/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        // Add other file paths here if necessary
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    400: '#a3a3a3',
                },
            },
        },
    },
    theme: {
        extend: {
          colors: {
            border: '#your-border-color', // Replace with your actual color
          },
        },
      },
    plugins: [],
};
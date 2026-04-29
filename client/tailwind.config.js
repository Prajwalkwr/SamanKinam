/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        "primary-200" : "#ef4444",
        "primary-100" : "#fca5a5",
        "secondary-200" : "#dc2626",
        "secondary-100" : "#0b1a78"
      }
    },
  },
  plugins: [],
}


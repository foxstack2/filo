import flowbite from "flowbite/plugin"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{tsx,html}",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  darkMode: "media",
  plugins: [flowbite]
}

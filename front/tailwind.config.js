/** @type {import('tailwindcss').Config} */
module.exports = {
  // Todas las carpetas que contienen clases de NativeWind
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Verde Pumax (logo: #0b6623)
        brand: {
          DEFAULT: "#0b6623",
          50: "#eefbf1",
          100: "#d6f5de",
          200: "#aeeabd",
          300: "#7bd893",
          400: "#45bd66",
          500: "#158a33",
          600: "#0b6623",
          700: "#095220",
          800: "#014e1b",
          900: "#052d12",
        },
        // Bordó Pumax (logo: #ae2151)
        wine: {
          DEFAULT: "#ae2151",
          300: "#f5dae1",
          400: "#e0507d",
          500: "#c42e5f",
          600: "#ae2151",
          700: "#8f1a42",
          800: "#701434",
          900: "#520e26",
        },
        // Neutros oscuros con un leve tinte verde (reemplaza al slate azulado)
        slate: {
          50: "#f4f7f5",
          100: "#e9eeeb",
          200: "#d5ddd8",
          300: "#b6c2bb",
          400: "#8a9a91",
          500: "#4d5f55",
          600: "#34433b",
          700: "#26322c",
          800: "#1b2420",
          900: "#131a16",
          950: "#0d1210",
        },
      },
    },
  },
  plugins: [],
};

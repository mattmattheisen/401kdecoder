module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecf7ff',
          100: '#d6eeff',
          200: '#b3e0ff',
          300: '#85cdff',
          400: '#57b6ff',
          500: '#35a0d6', // accent
          600: '#0c3b5e', // deep blue
        }
      }
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      backgroundImage: {
        abstract: "url(../src/assets/img/bg.jpg)",
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
};

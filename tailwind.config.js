/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0E1420",
        dusk: "#161E30",
        line: "#28324A",
        gold: "#C7972E",
        goldbright: "#E3B04B",
        mist: "#93A0BD",
        paper: "#F4F1EA",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

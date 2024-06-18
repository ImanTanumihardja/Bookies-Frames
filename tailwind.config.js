const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Helvetica Neue', ...defaultTheme.fontFamily.sans],
        body: ['Plus Jakarta Sans', 'Helvetica Neue', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        animatedgradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
      animation: {
        gradient: 'animatedgradient 6s ease infinite alternate',
      },
      colors: {
        gray: {
          "100": "#777",
          "200": "#1f2937",
          "300": "#2d2719",
          "400": "#112648",
          "500": "#1c2726",
          "600": "#1a202c",
          "700": "#111",
          "800": "rgba(255, 255, 255, 0.7)",
          "900": "rgba(255, 255, 255, 0.8)",
          "1000": "rgba(255, 255, 255, 0.6)",
        },
        white: "#fff",
        lightgray: {
          "100": "#ccc",
          "200": "rgba(204, 204, 204, 0.8)",
        },
        whitesmoke: "#eee",
        slategray: "#6b7685",
        darkslategray: {
          "100": "#1f4440",
          "200": "#2b384b",
        },
        silver: "#b7b7b7",
        firebrick: "#cc2727",
        lightseagreen: "#15b8a6",
        mediumslateblue: "#7d4fdf",
        darkorchid: "#a855f7",
        dodgerblue: "#3c82f6",
        darkolivegreen: "#705a14",
        goldenrod: "#ebb305",
        black: "#000",
      },
      spacing: {},
      fontFamily: {
        inter: "Inter",
      },
      borderRadius: {
        xl: "20px",
        lg: "18px",
      },
    },
    fontSize: {
      smi: "13px",
      mini: "15px",
      "5xl": "24px",
      "6xl": "30px",
      mid: "17px",
      "56xl": "75px",
      xl: "20px",
      inherit: "inherit",
    },
  },
  corePlugins: {
    preflight: false,
  },
};

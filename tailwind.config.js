/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: v("paper"),
        card: v("card"),
        ink: v("ink"),
        muted: v("muted"),
        line: "rgb(var(--line) / 0.12)",
        accent: v("accent"),
        gold: v("gold"),
        up: v("up"),
        down: v("down"),
      },
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        rise: { from: { opacity: 0, transform: "translateY(24px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: {
        fade: "fade .2s ease-out",
        rise: "rise .28s cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",

        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        muted: "var(--text-muted)",

        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",

        surface: "var(--surface)",

        success: "var(--success)",
        "success-bg": "var(--success-bg)",

        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)",
      },
    },  },
  plugins: [],
};

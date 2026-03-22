/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#27f7ff",
          magenta: "#ff3bf5",
          lime: "#b6ff3b"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(39, 247, 255, 0.25)",
        glow2: "0 0 35px rgba(255, 59, 245, 0.25)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 10s ease infinite"
      }
    }
  },
  plugins: []
};


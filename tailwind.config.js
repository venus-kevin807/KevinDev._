/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
theme: {
  extend: {
    colors: {
      primary: '#64ffda',
      secondary: '#8892b0',
      background: '#0a192f',
    }
  }
},
extend: {
    fontFamily: {
      sans: ['"Poppins"', 'sans-serif'],
    },
    animation: {
      'fade-in': 'fade-in 1.5s ease-in-out both',
      'text-flicker': 'text-flicker 2.5s ease-in-out infinite',
    },
    keyframes: {
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      'text-flicker': {
        '0%, 19.999%, 22%, 62.999%, 64%, 100%': { opacity: '0.99' },
        '20%, 21.999%, 63%, 63.999%, 65%, 100%': { opacity: '0.4' },
      },
    },
  },
  plugins: [],
}

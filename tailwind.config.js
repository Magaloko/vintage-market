/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          cream: '#F5F0E8',
          beige: '#E8DFD0',
          sand: '#D4C5A9',
          brown: '#6B4C3B',
          dark: '#3A2A1D',
          green: '#2D4A3E',
          gold: '#B8943E',
          rust: '#8B4513',
          paper: '#FAF7F0',
          ink: '#1A1A1A',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Cormorant Garamond', 'Garamond', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'paper-texture': "url('data:image/svg+xml,%3Csvg width=\"200\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\" opacity=\"0.03\"/%3E%3C/svg%3E')",
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        'scale-in': 'scaleIn 0.4s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

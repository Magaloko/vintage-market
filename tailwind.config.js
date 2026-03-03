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
          // Primary palette
          orange: '#C2642C',
          navy: '#0E1A2B',
          olive: '#5A6B3C',
          brown: '#5B3A29',
          paper: '#F2EDE3',
          gold: '#B89A5A',
          // Derived shades
          'navy-light': '#162438',
          'navy-dark': '#0A1220',
          'orange-light': '#D4784A',
          'orange-dark': '#A45322',
          'olive-light': '#6E7F4E',
          'olive-dark': '#485A30',
          'brown-light': '#7A5340',
          'brown-dark': '#3E271C',
          'paper-dark': '#E5DDD1',
          'paper-light': '#F7F3EC',
          'gold-light': '#CBB077',
          'gold-dark': '#9A7E42',
          // Text colors (no pure black/white)
          ink: '#1C1C1A',
          cream: '#F2EDE3',
          'warm-light': '#E8DFD1',
          // Aliases used in components
          dark: '#0E1A2B',
          beige: '#F2EDE3',
          sand: '#E5DDD1',
          green: '#5A6B3C',
          copper: '#C2642C',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Cormorant Garamond', 'Garamond', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        btn: '6px',
      },
      borderColor: {
        'vintage-border': 'rgba(91, 58, 41, 0.2)',
      },
      boxShadow: {
        'vintage-sm': '0 1px 3px rgba(91, 58, 41, 0.06)',
        'vintage': '0 4px 12px rgba(91, 58, 41, 0.08)',
        'vintage-lg': '0 8px 24px rgba(91, 58, 41, 0.12)',
        'vintage-card': '0 2px 8px rgba(14, 26, 43, 0.06)',
        'vintage-card-hover': '0 8px 24px rgba(14, 26, 43, 0.12)',
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

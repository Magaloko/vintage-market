/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gdt: {
          black: '#0C0A08',
          charcoal: '#1A1410',
          bronze: '#B08D57',
          'bronze-light': '#C9A96E',
          'bronze-dark': '#8A6D3B',
          gold: '#D4AF6A',
          copper: '#C9956B',
          cream: '#F0E6D6',
          'cream-dark': '#E0D4C0',
          pearl: '#F7F2EB',
          ink: '#2C2420',
          warm: '#3D3229',
          rose: '#B5736A',
          sage: '#7A8B6F',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Garamond', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        btn: '4px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(176, 141, 87, 0.15)',
        'glow-sm': '0 0 20px rgba(176, 141, 87, 0.1)',
        card: '0 4px 20px rgba(12, 10, 8, 0.08)',
        'card-hover': '0 12px 40px rgba(12, 10, 8, 0.15)',
        luxury: '0 8px 32px rgba(176, 141, 87, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out both',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slideDown 0.5s ease-out both',
        'scale-in': 'scaleIn 0.5s ease-out both',
        shimmer: 'shimmer 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}

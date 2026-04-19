/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        /* ================================================================
           SENSEI SUGGEST — CRIMSON/CHARCOAL/CREAM SYSTEM
           Base palette: #DD0426, #2A1F2D, #F5EBE0
           ================================================================ */

        // Backgrounds
        'ss-bg':       '#0D0D0D',
        'ss-surface':  '#111111',
        'ss-elevated': '#1A1A1A',
        'ss-border':   '#2A2A2A',
        // ... (rest of colors)
        'kawaii-bg':          '#0D0D0D',
        'kawaii-card':        '#111111',
        'anime-bg':           '#0D0D0D',
        'anime-card':         '#111111',
        'anime-sub-card':     '#1A1A1A',
        'anime-border':       '#2A2A2A',
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'sans':    ['Inter', 'sans-serif'],
        'mono':    ['Space Grotesk', 'sans-serif'],
        'accent':  ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'ss-card': '0 4px 24px rgba(0,0,0,0.6)',
        'ss-lift': '0 20px 60px rgba(0,0,0,0.7)',
        'ss-glow': '0 0 20px rgba(221,4,38,0.3)',
        // Legacy
        'kawaii-glow': '0 0 18px rgba(221,4,38,0.3)',
        'kawaii-soft': '0 10px 30px rgba(0,0,0,0.6)',
        'anime-glow':  '0 0 14px rgba(221,4,38,0.3)',
      },
      backgroundImage: {
        'ss-red-gradient': 'linear-gradient(135deg, #DD0426, #A10A24)',
      },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        shimmer:   { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
      }
    },
  },
  plugins: [],
}

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
           SENSEI SUGGEST — "EDITORIAL DARK" PALETTE  (v3, anti-AI-cliché)
           Philosophy: ONE brand accent (crimson), warm-neutral base.
           No pink/violet/cyan trio. Think anime box-art, not AI generator.
           ================================================================ */

        // Backgrounds — slightly warmer than cold blue-black
        'ss-bg':       '#0C0C0E',  // Near-black, faint warm undertone
        'ss-surface':  '#131316',  // Card surfaces
        'ss-elevated': '#1A1A20',  // Elevated layers, modals
        'ss-border':   '#222228',  // All borders

        // Neutrals — warm white, not clinical cold
        'ss-text':  '#F0F0F5',  // Primary body text
        'ss-muted': '#888895',  // Secondary / labels
        'ss-faint': '#3A3A4A',  // Disabled / placeholder

        // ── Single brand accent: Anime Crimson ──
        // Inspired by: Demon Slayer's red, Attack on Titan palette, anime magazine headers
        'ss-red':     '#E8385A',  // Primary CTA, links, active states
        'ss-red-dim': '#B82D48',  // Hover, pressed

        // Supporting — used sparingly in gradients / charts only
        'ss-violet': '#6D28D9',  // CTA gradient end
        'ss-amber':  '#D97706',  // Star ratings

        /* ── Legacy Aliases (keeps old pages from breaking) ── */
        'kawaii-bg':          '#0C0C0E',
        'kawaii-card':        '#131316',
        'kawaii-text-light':  '#F0F0F5',
        'kawaii-text-dark':   '#F0F0F5',
        'kawaii-text-muted':  '#888895',
        'kawaii-accent':      '#E8385A',
        'kawaii-accent-dark': '#B82D48',
        'kawaii-secondary':   '#22D3EE',  // kept for chart compat
        'kawaii-tertiary':    '#6D28D9',
        'kawaii-border':      '#222228',
        'kawaii-error':       '#EF4444',
        'kawaii-mint':        '#22D3EE',
        'anime-bg':           '#0C0C0E',
        'anime-card':         '#131316',
        'anime-sub-card':     '#1A1A20',
        'anime-text-light':   '#F0F0F5',
        'anime-text-dark':    '#F0F0F5',
        'anime-accent':       '#E8385A',
        'anime-accent-dark':  '#B82D48',
        'anime-border':       '#222228',
        'anime-error':        '#EF4444',
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
        'ss-glow': '0 0 20px rgba(232,56,90,0.3)',
        // Legacy
        'kawaii-glow': '0 0 18px rgba(232,56,90,0.3)',
        'kawaii-soft': '0 10px 30px rgba(0,0,0,0.6)',
        'anime-glow':  '0 0 14px rgba(232,56,90,0.3)',
      },
      backgroundImage: {
        'ss-red-gradient': 'linear-gradient(135deg, #E8385A, #6D28D9)',
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

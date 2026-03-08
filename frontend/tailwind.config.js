/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        /* Dark Anime Palette */
        'kawaii-bg': '#0B0F19',           // Deep dark blue/black background
        'kawaii-card': '#111827',         // Dark gray for cards
        'kawaii-text-light': '#FFFFFF',   // White text
        'kawaii-text-dark': '#E5E7EB',    // Light gray text (replacing old dark text)
        'kawaii-text-muted': '#9CA3AF',
        'kawaii-accent': '#FF2E93',       // Neon pink accent
        'kawaii-accent-dark': '#E60073',  // Darker hover pink
        'kawaii-secondary': '#00E5FF',    // Cyberpunk Cyan
        'kawaii-tertiary': '#9D4EDD',     // Neon Purple
        'kawaii-mint': '#39FF14',         // Neon Green
        'kawaii-border': '#1F2937',       // Dark border
        'kawaii-error': '#FF4C4C',        // vibrant red for errors

        /* Legacy Aliases (to prevent instant breakage before components are updated) */
        'anime-bg': '#0B0F19',          
        'anime-card': '#111827',        
        'anime-text-light': '#FFFFFF',  
        'anime-text-dark': '#E5E7EB',   
        'anime-accent': '#FF2E93',      
        'anime-accent-dark': '#E60073', 
        'anime-border': '#1F2937',      
        'anime-error': '#FF4C4C',
        'anime-sub-card': '#1F2937',
      },
      fontFamily: {
        'sans': ['Nunito', 'sans-serif'],
        'display': ['Fredoka', 'sans-serif'],
      },
      boxShadow: {
        'kawaii-glow': '0 0 20px rgba(255, 46, 147, 0.4)',
        'kawaii-soft': '0 10px 25px rgba(0, 0, 0, 0.5)',
        'anime-glow': '0 0 15px rgba(255, 46, 147, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'bounce-slight': 'bounceSlight 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        bounceSlight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}

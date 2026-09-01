/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'surface-subtle': 'var(--bg-surface-subtle)',
        'surface-card': 'var(--bg-surface-card)',
        'surface-hover': 'var(--bg-surface-hover)',
        border: 'var(--border-color)',
        'border-focus': 'var(--border-focus)',
        
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: 'var(--primary)',
          600: 'var(--primary-hover)',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: 'var(--primary)',
        },
        accent: {
          500: 'var(--accent)',
          DEFAULT: 'var(--accent)',
        },
        text: {
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px -5px var(--primary-glow)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

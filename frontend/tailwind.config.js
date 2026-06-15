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
        slate: {
          850: '#1e293b',
          900: '#0f172a',
          950: '#070a13',
        },
        clinical: {
          stable: '#10b981',
          warning: '#fbbf24',
          highRisk: '#f97316',
          critical: '#ef4444',
          bg: '#05070f',
          panel: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(51, 65, 85, 0.5)',
          accent: '#3b82f6',
          accentGlow: 'rgba(59, 130, 246, 0.15)',
        },
        medical: {
          primary: '#059669',
          secondary: '#10b981',
          accent: '#34d399',
          light: '#d1fae5',
          dark: '#064e3b',
          bg: '#f0fdf4',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-critical': '0 0 15px rgba(239, 68, 68, 0.5)',
        'glow-warning': '0 0 15px rgba(251, 191, 36, 0.4)',
        'glow-accent': '0 0 15px rgba(59, 130, 246, 0.4)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.12)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.2)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'ecg': 'ecgLine 2s linear infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'progress': 'progressBar 3s ease-in-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scanLine 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.2)' },
          '50%': { boxShadow: '0 0 22px rgba(239, 68, 68, 0.75)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        ecgLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '56%': { transform: 'scale(1)' },
        },
        progressBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      }
    },
  },
  plugins: [],
}

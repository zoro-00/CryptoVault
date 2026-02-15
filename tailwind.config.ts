import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'crypto-gradient': 'linear-gradient(135deg, #00D4FF 0%, #6366F1 50%, #F7931A 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: '#0F172A',
        foreground: '#F8FAFC',
        card: {
          DEFAULT: 'rgba(30, 41, 59, 0.8)',
          foreground: '#F8FAFC',
        },
        popover: {
          DEFAULT: 'rgba(30, 41, 59, 0.95)',
          foreground: '#F8FAFC',
        },
        primary: {
          DEFAULT: '#00D4FF',
          foreground: '#0F172A',
        },
        secondary: {
          DEFAULT: '#F7931A',
          foreground: '#0F172A',
        },
        muted: {
          DEFAULT: 'rgba(71, 85, 105, 0.5)',
          foreground: '#CBD5E1',
        },
        accent: {
          DEFAULT: '#6366F1',
          foreground: '#F8FAFC',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F8FAFC',
        },
        success: '#10B981',
        crypto: {
          bitcoin: '#F7931A',
          ethereum: '#627EEA',
          electric: '#00D4FF',
        },
        border: 'rgba(71, 85, 105, 0.3)',
        input: 'rgba(30, 41, 59, 0.8)',
        ring: '#00D4FF',
        chart: {
          '1': '#00D4FF',
          '2': '#F7931A',
          '3': '#10B981',
          '4': '#EF4444',
          '5': '#6366F1',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;

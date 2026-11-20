/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cred: {
          black: '#0a0a0a',
          dark: '#111111',
          card: '#1a1a1a',
          elevated: '#222222',
          border: '#2a2a2a',
          gold: '#c9a84c',
          'gold-light': '#e8c878',
          green: '#00d4aa',
          red: '#ff4757',
          purple: '#8b5cf6',
          'text-primary': '#ffffff',
          'text-secondary': '#a0a0a0',
          'text-muted': '#606060',
        },
      },
      boxShadow: {
        'cred-card': '0 4px 24px rgba(0,0,0,0.4)',
        'cred-elevated': '0 8px 40px rgba(0,0,0,0.6)',
        'cred-gold': '0 0 20px rgba(201,168,76,0.2)',
        'cred-gold-strong': '0 0 30px rgba(201,168,76,0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a84c, #e8c878)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
        'card-gradient': 'linear-gradient(145deg, #1e1e1e, #141414)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}

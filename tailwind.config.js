/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adapt: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#06b6d4',
          bg: {
            primary: '#0f172a',
            secondary: '#1e293b',
            tertiary: '#334155',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            muted: '#94a3b8',
          },
          border: '#475569',
        },
        graph: {
          symptom: '#ef4444',
          hypothesis: '#f59e0b',
          test: '#06b6d4',
          finding: '#8b5cf6',
          remediation: '#10b981',
          node: '#64748b',
          edge: '#475569',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

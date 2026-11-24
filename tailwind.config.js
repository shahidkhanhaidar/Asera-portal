/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
      colors: { ink: '#0a0a0a', canvas: '#f3f3f3', line: '#e6e6e6', muted: '#6b6b6b' },
    },
  },
  plugins: [],
};

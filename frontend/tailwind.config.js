/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1a1032', light: '#3d2c5e', muted: '#6b5f7d', deep: '#140d24', border: '#2d204a' },
        surface: { DEFAULT: '#faf9fe', raised: '#ffffff', sunken: '#f0eef5' },
        coral: { DEFAULT: '#ff6b6b', soft: '#fff0f0' },
        indigo: { DEFAULT: '#4a1d96', soft: '#ede7f9', deep: '#3b1578', muted: '#8c7baf' },
        teal: { DEFAULT: '#0d9488', soft: '#e6faf8' },
        amber: { DEFAULT: '#d97706', soft: '#fef3c7' },
        border: { DEFAULT: '#e8e5f0' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '10px',
        lg: '20px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(26,16,50,0.04), 0 1px 2px rgba(26,16,50,0.06)',
        card: '0 4px 16px rgba(26,16,50,0.06), 0 2px 4px rgba(26,16,50,0.04)',
        float: '0 12px 40px rgba(26,16,50,0.08), 0 4px 12px rgba(26,16,50,0.04)',
        glow: '0 0 0 3px rgba(74,29,150,0.12)',
      },
    },
  },
  plugins: [],
};

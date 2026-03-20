/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#00332c', deep: '#002621' },
        mint: { DEFAULT: '#29f59f', soft: '#f4fffb', border: '#e6f7f0' },
        ink: { DEFAULT: '#00332c', muted: '#6b7c7a' },
        surface: { DEFAULT: '#ffffff', raised: '#ffffff', sunken: '#f8fbf9' },
        coral: { DEFAULT: '#ff6b6b' },
        amber: { DEFAULT: '#f59e0b' },
        border: { DEFAULT: '#e8eee4' },
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

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'forest-green': '#2E7D32',
        'eco-green': '#4CAF50',
        'nature-green': '#388E3C',
        'tech-blue': '#00BCD4',
        'alert-orange': '#FF9800',
        'deep-blue': '#1976D2',
        'earth-red': '#F44336',
        'dark-forest': '#1B5E20',
        'light-green': '#E8F5E8',
        'sage': '#C8E6C9',
        'gray': '#757575',
        'light-gray': '#F5F5F5',
        'white': '#FFFFFF',
      },
      borderRadius: {
        'lg': '12px',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F4ED',
        ink: '#16130F',
        muted: '#6B6459',
        rule: '#DED7C9',
        accent: '#8A2B1E'
      },
      fontFamily: {
        display: ['Instrument Serif', 'Libre Baskerville', 'serif'],
        body: ['Inter Tight', 'system-ui', 'sans-serif']
      },
      fontSize: {
        sm: '12px',
        base: '15px',
        lg: '18px',
        xl: '20px'
      }
    }
  },
  plugins: []
};

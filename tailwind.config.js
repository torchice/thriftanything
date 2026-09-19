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
        paper: '#FBF7EF',
        tan: '#F1E8D8',
        ink: '#1B1712',
        body: '#3F362B',
        rule: '#DFD3BE',
        edge: '#9E8055',
        forest: '#1F4D3A',
        'forest-deep': '#173B2D',
        clay: '#A4442B',
        'tint-green': '#E2EDE4',
        'tint-tan': '#EDE0C9',
        'tint-clay': '#F6E3DA'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.65' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['22px', { lineHeight: '1.35' }],
        '2xl': ['28px', { lineHeight: '1.2' }],
        '3xl': ['36px', { lineHeight: '1.15' }],
        '4xl': ['46px', { lineHeight: '1.08' }],
        '5xl': ['62px', { lineHeight: '1.02' }]
      },
      maxWidth: {
        prose: '62ch'
      }
    }
  },
  plugins: []
};

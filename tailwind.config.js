/** SMEC Group design tokens — Tailwind CSS v3 (clean, IBM Carbon–inspired) */
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      // Clean corporate palette: neutral grays + one primary (#09202E).
      // Token names are kept from the previous theme so JS-rendered markup still maps.
      colors: {
        brand: {
          DEFAULT: '#09202E', // SMEC primary: deep petrol navy (16:1 on white)
          950: '#030D13',
          900: '#051620',
          800: '#071B27',
          700: '#041219', // pressed
          600: '#143A50', // hover (lighter)
          400: '#8FB7CC', // accent on dark backgrounds
          200: '#BCD5E2',
          100: '#DAE8EF',
          50: '#EDF4F7',
        },
        ink: {
          DEFAULT: '#161616',
          900: '#161616',
          800: '#262626',
          700: '#393939',
          600: '#525252', // secondary text
          500: '#6F6F6F', // helper text
          400: '#8D8D8D',
          300: '#C6C6C6', // secondary text on dark
        },
        paper: {
          DEFAULT: '#FFFFFF',
          50: '#F4F4F4',  // layer / field background
          100: '#E8E8E8', // layer hover
          200: '#E0E0E0', // subtle borders
          300: '#C6C6C6',
        },
        accent: {
          DEFAULT: '#09202E',
          500: '#09202E',
          300: '#8FB7CC',
          50: '#EDF4F7',
        },
        danger: '#DA1E28',
        success: '#24A148',
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 4.2vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '300' }],
        'display-lg': ['clamp(2rem, 3.6vw, 3.25rem)', { lineHeight: '1.16', letterSpacing: '0', fontWeight: '300' }],
        'display-md': ['clamp(1.625rem, 2.6vw, 2.625rem)', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '300' }],
        'display-sm': ['clamp(1.25rem, 1.7vw, 1.75rem)', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '400' }],
      },
      maxWidth: { site: '1440px', prose: '68ch' },
      borderColor: { DEFAULT: '#E0E0E0' },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        ping2: { '0%': { transform: 'scale(1)', opacity: '.7' }, '100%': { transform: 'scale(3.2)', opacity: '0' } },
        dash: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        ping2: 'ping2 2.6s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
};

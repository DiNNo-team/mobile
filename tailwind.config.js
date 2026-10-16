// Tailwind only knows the DiNNo tokens (manual 16): the default palette, radii, shadows and text
// sizes are replaced, so `bg-slate-50`, `rounded-lg` or `text-5xl` do not exist in this app.
// Colors read CSS variables that src/theme/ThemeProvider sets for light and dark
// (values in src/theme/tokens.ts, names in src/theme/css-vars.ts; a test keeps both lists equal).

const colorNames = [
  'bg', 'surface', 'surface-2', 'fg', 'fg-2', 'line', 'line-strong',
  'accent', 'accent-pressed', 'accent-text', 'on-accent', 'brand', 'on-brand',
  'ok', 'limited', 'reserved', 'busy', 'inactive', 'error', 'info',
  'inverse', 'on-inverse', 'inverse-accent',
];

const colors = Object.fromEntries(colorNames.map((name) => [name, `rgb(var(--${name}) / <alpha-value>)`]));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    colors: { ...colors, transparent: 'transparent' },
    borderRadius: { none: '0px', input: '12px', btn: '14px', tile: '16px', card: '20px', sheet: '28px', chip: '999px' },
    boxShadow: {},
    fontWeight: {},
    fontSize: {
      display: ['48px', { lineHeight: '52px', letterSpacing: '-1.44px' }],
      h1: ['32px', { lineHeight: '36px', letterSpacing: '-0.96px' }],
      h2: ['24px', { lineHeight: '28px', letterSpacing: '-0.48px' }],
      h3: ['18px', { lineHeight: '24px', letterSpacing: '-0.18px' }],
      body: ['16px', { lineHeight: '24px' }],
      sec: ['14px', { lineHeight: '20px' }],
      label: ['11px', { lineHeight: '14px', letterSpacing: '0.88px' }],
      figure: ['54px', { lineHeight: '54px', letterSpacing: '-2.16px' }],
      button: ['15px', { lineHeight: '20px' }],
      chip: ['12px', { lineHeight: '16px' }],
    },
    extend: {
      // In `extend` because the NativeWind preset extends `sans` with the system font and would win otherwise.
      fontFamily: {
        sans: ['PlusJakartaSans_500Medium'],
        bold: ['PlusJakartaSans_700Bold'],
        extrabold: ['PlusJakartaSans_800ExtraBold'],
      },
      borderWidth: { 1.5: '1.5px', 3: '3px' },
      opacity: { 12: '0.12', 45: '0.45', 55: '0.55' },
      // Manual 9: empty states 360, dialogs 480, toasts 400.
      maxWidth: { empty: '360px', dialog: '480px', toast: '400px' },
    },
  },
  plugins: [],
};

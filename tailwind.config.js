// Tailwind only knows the DiNNo tokens (manual v2.0, section 16): the default palette, radii, shadows and text
// sizes are replaced, so `bg-slate-50`, `rounded-lg` or `text-5xl` do not exist in this app.
// Colors read CSS variables that src/theme/ThemeProvider sets for light and dark
// (values in src/theme/tokens.ts, names in src/theme/css-vars.ts; a test keeps both lists equal).

const { platformSelect } = require('nativewind/theme');

const colorNames = [
  'bg', 'surface', 'surface-2', 'fg', 'fg-2', 'line', 'line-strong',
  'accent', 'accent-pressed', 'accent-text', 'on-accent', 'brand', 'on-brand',
  'ok', 'limited', 'reserved', 'busy', 'inactive', 'error', 'info',
  'inverse', 'on-inverse', 'inverse-accent',
  // v2.0 (manual 16.6)
  'selection', 'tint-ok', 'tint-reserved', 'tint-busy', 'tint-limited', 'edge-ok', 'edge-reserved', 'edge-busy', 'edge-limited',
  // Mobile v3 (diseño definitivo)
  'sand', 'caption', 'well', 'danger-text',
];

const colors = Object.fromEntries(colorNames.map((name) => [name, `rgb(var(--${name}) / <alpha-value>)`]));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    colors: { ...colors, transparent: 'transparent' },
    borderRadius: {
      none: '0px', input: '12px', btn: '14px', tile: '16px', card: '20px', sheet: '28px', chip: '999px',
      // Mobile v3: matte pieces with radii from 24 to 36 (ficha de dirección).
      piece: '24px', panel: '28px', ticket: '32px', frame: '36px',
    },
    boxShadow: {},
    fontWeight: {},
    fontSize: {
      display: ['48px', { lineHeight: '52px', letterSpacing: '-1.44px' }],
      h1: ['28px', { lineHeight: '32px', letterSpacing: '-0.7px' }],
      h2: ['22px', { lineHeight: '28px', letterSpacing: '-0.33px' }],
      h3: ['18px', { lineHeight: '24px', letterSpacing: '-0.18px' }],
      body: ['16px', { lineHeight: '24px' }],
      sec: ['14px', { lineHeight: '20px' }],
      label: ['12px', { lineHeight: '16px', letterSpacing: '0.12px' }],
      kicker: ['11px', { lineHeight: '14px', letterSpacing: '0.88px' }],
      metric: ['28px', { lineHeight: '32px', letterSpacing: '-0.84px' }],
      figure: ['54px', { lineHeight: '54px', letterSpacing: '-2.16px' }],
      button: ['15px', { lineHeight: '20px' }],
      chip: ['12px', { lineHeight: '16px' }],
      // Mobile v3 (diseño definitivo): big headlines, tabular figures and the ticket.
      hero: ['56px', { lineHeight: '58px', letterSpacing: '-2.6px' }],
      screen: ['42px', { lineHeight: '44px', letterSpacing: '-1.8px' }],
      title: ['40px', { lineHeight: '42px', letterSpacing: '-1.7px' }],
      timer: ['46px', { lineHeight: '50px', letterSpacing: '-1.6px' }],
      distance: ['30px', { lineHeight: '32px', letterSpacing: '-1px' }],
      page: ['28px', { lineHeight: '34px', letterSpacing: '-0.8px' }],
      name: ['24px', { lineHeight: '28px', letterSpacing: '-0.6px' }],
      stat: ['22px', { lineHeight: '28px', letterSpacing: '-0.6px' }],
      code: ['21px', { lineHeight: '26px' }],
      section: ['20px', { lineHeight: '26px', letterSpacing: '-0.4px' }],
      action: ['17px', { lineHeight: '22px', letterSpacing: '-0.2px' }],
      lead: ['15px', { lineHeight: '22px' }],
      small: ['13px', { lineHeight: '18px' }],
    },
    extend: {
      // In `extend` because the NativeWind preset extends `sans` with the system font and would win otherwise.
      fontFamily: {
        // Android finds the embedded font by file name, iOS by PostScript name (same pairs as src/theme/tokens.ts).
        sans: platformSelect({ ios: 'PlusJakartaSans-Medium', default: 'PlusJakartaSans_500Medium' }),
        bold: platformSelect({ ios: 'PlusJakartaSans-Bold', default: 'PlusJakartaSans_700Bold' }),
        extrabold: platformSelect({ ios: 'PlusJakartaSans-ExtraBold', default: 'PlusJakartaSans_800ExtraBold' }),
      },
      borderWidth: { 1.5: '1.5px', 3: '3px' },
      opacity: { 12: '0.12', 45: '0.45', 55: '0.55' },
      // Manual 9: empty states 360, dialogs 480, toasts 400.
      maxWidth: { empty: '360px', dialog: '480px', toast: '400px' },
    },
  },
  plugins: [],
};

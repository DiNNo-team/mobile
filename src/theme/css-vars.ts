import { dark, light } from './tokens';

type Palette = typeof light;

/**
 * Tailwind class name → token key. The names are the same as the web (`bg-surface`, `text-fg`,
 * `border-line`…), so a screen reads the same in both repos.
 */
export const colorTokens = {
  bg: 'bg',
  surface: 'surface',
  'surface-2': 'surface2',
  fg: 'text',
  'fg-2': 'text2',
  line: 'border',
  'line-strong': 'borderStrong',
  accent: 'accent',
  'accent-pressed': 'accentPressed',
  'accent-text': 'accentText',
  'on-accent': 'onAccent',
  brand: 'brand',
  'on-brand': 'onBrand',
  ok: 'ok',
  limited: 'limited',
  reserved: 'reserved',
  busy: 'busy',
  inactive: 'inactive',
  error: 'error',
  info: 'info',
  inverse: 'inverseBg',
  'on-inverse': 'inverseText',
  'inverse-accent': 'inverseAccent',
} as const satisfies Record<string, keyof Palette>;

/** '#F46935' → '244 105 53', the format `rgb(var(--x) / <alpha-value>)` needs for `bg-ok/15`. */
export function hexToRgbChannels(hex: string): string {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
  return channels.join(' ');
}

function toCssVars(palette: Palette): Record<`--${string}`, string> {
  return Object.fromEntries(
    Object.entries(colorTokens).map(([name, key]) => [`--${name}`, hexToRgbChannels(palette[key])]),
  ) as Record<`--${string}`, string>;
}

/** CSS variables per color scheme; ThemeProvider applies them with NativeWind's `vars()`. */
export const cssVars = { light: toCssVars(light), dark: toCssVars(dark) };

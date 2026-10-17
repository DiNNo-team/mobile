import { colorTokens, cssVars, hexToRgbChannels } from './css-vars';
import { dark, light } from './tokens';

// tailwind.config.js is CommonJS and keeps its own list of color names.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindConfig = require('../../tailwind.config.js') as { theme: { colors: Record<string, string> } };

describe('design tokens', () => {
  it('converts hex to the rgb channels Tailwind needs', () => {
    expect(hexToRgbChannels('#F46935')).toBe('244 105 53');
    expect(hexToRgbChannels('#0B2D36')).toBe('11 45 54');
  });

  it('Tailwind knows exactly the token colors (plus transparent)', () => {
    const tailwindNames = Object.keys(tailwindConfig.theme.colors).filter((name) => name !== 'transparent');
    expect(tailwindNames.sort()).toEqual(Object.keys(colorTokens).sort());
  });

  it('light and dark define every variable', () => {
    expect(Object.keys(cssVars.light)).toEqual(Object.keys(cssVars.dark));
    expect(cssVars.light['--accent']).toBe(hexToRgbChannels(light.accent));
    expect(cssVars.dark['--accent']).toBe(hexToRgbChannels(dark.accent));
  });
});

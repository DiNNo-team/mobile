import { IOS_FONT_NAMES, type } from './tokens';

describe('iOS font names', () => {
  it('every font family of the manual has its iOS PostScript name', () => {
    const families = new Set(
      Object.values(type as Record<string, { fontFamily?: string }>).flatMap((style) =>
        style.fontFamily ? [style.fontFamily] : [],
      ),
    );
    for (const family of families) {
      // On Android (the tests' platform) the families keep the manual's names; each one must map on iOS.
      expect(Object.keys(IOS_FONT_NAMES).concat(Object.values(IOS_FONT_NAMES))).toContain(family);
    }
  });

  it('maps to the PostScript names inside the embedded font files', () => {
    expect(IOS_FONT_NAMES).toEqual({
      PlusJakartaSans_500Medium: 'PlusJakartaSans-Medium',
      PlusJakartaSans_700Bold: 'PlusJakartaSans-Bold',
      PlusJakartaSans_800ExtraBold: 'PlusJakartaSans-ExtraBold',
    });
  });
});

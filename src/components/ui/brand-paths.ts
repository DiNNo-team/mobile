// Vector paths of the DiNNo brand files (frontend/src/assets/brand/logo-light.svg and symbol.svg).
// Never redraw the logo with text: use Logo and BrandSymbol, which read these paths.

/** Whole logo box: "Di" (ink), the pin "i", "NNo" (orange). */
export const LOGO_VIEWBOX = '-12 -107 351.4 119';
export const LOGO_LETTER_D = 'M7.15 0V-74.5H31.5Q43.33 -74.5 52.06 -69.76Q60.8 -65.03 65.6 -56.64Q70.4 -48.25 70.4 -37.26Q70.4 -26.38 65.6 -17.94Q60.8 -9.5 52.06 -4.75Q43.33 0 31.5 0ZM20.78 -12H31.8Q39.4 -12 44.96 -15.12Q50.53 -18.25 53.6 -23.93Q56.68 -29.61 56.68 -37.33Q56.68 -45.05 53.59 -50.68Q50.51 -56.32 44.95 -59.41Q39.4 -62.5 31.8 -62.5H20.78Z';
export const LOGO_LETTERS_NNO = ['M127.15 0V-74.5H137.82L178.75 -19.3L173.28 -18.18V-74.5H186.9V0H176.15L135.75 -55.6L140.78 -56.73V0Z', 'M198.25 0V-74.5H208.93L249.85 -19.3L244.38 -18.18V-74.5H258V0H247.25L206.85 -55.6L211.88 -56.73V0Z', 'M294.85 1.2Q286.88 1.2 280.34 -2.49Q273.8 -6.18 269.93 -12.6Q266.05 -19.03 266.05 -27.2Q266.05 -35.43 269.91 -41.8Q273.78 -48.18 280.3 -51.86Q286.83 -55.55 294.85 -55.55Q302.88 -55.55 309.36 -51.88Q315.85 -48.2 319.7 -41.83Q323.55 -35.45 323.55 -27.2Q323.55 -19 319.66 -12.57Q315.78 -6.15 309.29 -2.48Q302.8 1.2 294.85 1.2ZM294.85 -10.8Q299.28 -10.8 302.65 -12.9Q306.03 -15 307.98 -18.73Q309.93 -22.45 309.93 -27.2Q309.93 -31.95 307.98 -35.61Q306.03 -39.28 302.65 -41.41Q299.28 -43.55 294.85 -43.55Q290.43 -43.55 287.01 -41.41Q283.6 -39.28 281.64 -35.61Q279.68 -31.95 279.68 -27.2Q279.68 -22.45 281.64 -18.73Q283.6 -15 287.01 -12.9Q290.43 -10.8 294.85 -10.8Z'];
/** The pin of the "i" sits at this offset inside the logo box; its stem is 50 units tall there. */
export const LOGO_PIN_OFFSET = { x: 74, y: -95 };

/** Symbol geometry, 44 x 64 box: pin outline, the Active Dot and the stem. */
export const SYMBOL_VIEWBOX = '0 0 44 64';
export const SYMBOL_PIN = 'M22 40 L11.54 21.38 A12 12 0 1 1 32.46 21.38 Z';
export const SYMBOL_DOT = { cx: 22, cy: 15.5, r: 5 };
export const SYMBOL_STEM = { x: 16.5, y: 45, width: 11, height: 19, rx: 5.5 };
export const SYMBOL_STROKE = 7;

// DiNNo design tokens (manual de identidad v1.1). This is the only file with raw design values.
// `light`, `dark`, `radius`, `space`, `type` and `motion` are a verbatim copy of section 16.5;
// `lightExtras` / `darkExtras` are the values of section 16.3 that 16.5 does not include yet.

export const light = {
  bg:'#FAF7F1', surface:'#FFFFFF', surface2:'#F2EFE8', text:'#10252B', text2:'#5E6B70',
  border:'#E2E6E3', borderStrong:'#8A9699', accent:'#F46935', accentPressed:'#DB5626', accentText:'#B83F14', onAccent:'#10252B',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#2B8F62', limited:'#B7801F', reserved:'#4E66C9', busy:'#6E7C80',
  inactive:'#8A9699', error:'#C8453A', info:'#1D5661', inverseBg:'#103B46', inverseText:'#FAF7F1', inverseAccent:'#FF8456',
};
export const dark: typeof light = {
  bg:'#0B2D36', surface:'#103B46', surface2:'#164853', text:'#FAF7F1', text2:'#A9BDC0',
  border:'#24525D', borderStrong:'#5E8A93', accent:'#FF8456', accentPressed:'#F46935', accentText:'#FF8456', onAccent:'#0B2D36',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#3FBF86', limited:'#E0A93B', reserved:'#8DA2F0', busy:'#8DA0A4',
  inactive:'#6F8C92', error:'#FF7B6E', info:'#7FC1CB', inverseBg:'#FAF7F1', inverseText:'#10252B', inverseAccent:'#B83F14',
};
export const radius = { card:20, tile:16, btn:14, input:12, sheet:28, chip:999 };
export const space = { 1:4, 2:8, 3:12, 4:16, 5:24, 6:32, 7:48 };
export const type = {
  display:{ fontSize:48, lineHeight:52, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-1.44 },
  h1:{ fontSize:32, lineHeight:36, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-0.96 },
  h2:{ fontSize:24, lineHeight:28, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.48 },
  h3:{ fontSize:18, lineHeight:24, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.18 },
  body:{ fontSize:16, lineHeight:24, fontFamily:'PlusJakartaSans_500Medium' },
  sec:{ fontSize:14, lineHeight:20, fontFamily:'PlusJakartaSans_500Medium' },
  label:{ fontSize:11, lineHeight:14, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:0.88, textTransform:'uppercase' as const },
  figure:{ fontSize:54, lineHeight:54, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-2.16, fontVariant:['tabular-nums'] as const },
};
export const motion = { fast:150, base:200, slow:300, easing:[0.2,0.8,0.2,1] as const };

// Section 16.3 values used by the app that are not part of 16.5.
export const lightExtras = {
  overlay: 'rgba(11,45,54,.55)',
  focusRing: 'rgba(244,105,53,.45)',
  glassBg: 'rgba(255,255,255,.70)',
  glassBorder: 'rgba(255,255,255,.65)',
  shadowSoft: '0 1px 2px rgba(16,37,43,.05), 0 10px 28px -12px rgba(16,37,43,.18)',
  shadowFloat: '0 12px 32px -12px rgba(16,37,43,.28)',
  mapGround: '#E6E9E3', mapBlock: '#F6F4EE', mapPark: '#D3E2D3', mapWater: '#CBDFE3', mapAvenue: '#D5DCD7',
};
export const darkExtras: typeof lightExtras = {
  overlay: 'rgba(0,0,0,.6)',
  focusRing: 'rgba(255,132,86,.55)',
  glassBg: 'rgba(16,59,70,.62)',
  glassBorder: 'rgba(255,255,255,.16)',
  shadowSoft: '0 1px 2px rgba(0,0,0,.25), 0 10px 28px -12px rgba(0,0,0,.5)',
  shadowFloat: '0 12px 32px -12px rgba(0,0,0,.6)',
  mapGround: '#0F3540', mapBlock: '#134451', mapPark: '#14463F', mapWater: '#0E4B5A', mapAvenue: '#1A5360',
};

// Text sizes the manual gives outside the type scale (section 4 and 9).
export const textExtras = {
  button: { fontSize: 15, lineHeight: 20, fontFamily: 'PlusJakartaSans_700Bold' },
  fieldLabel: { fontSize: 14, lineHeight: 20, fontFamily: 'PlusJakartaSans_700Bold' },
  chip: { fontSize: 12, lineHeight: 16, fontFamily: 'PlusJakartaSans_700Bold' },
};

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof light & typeof lightExtras;

export const themes: Record<ColorScheme, ThemeColors> = {
  light: { ...light, ...lightExtras },
  dark: { ...dark, ...darkExtras },
};

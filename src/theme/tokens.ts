// DiNNo design tokens (manual de identidad v2.0, sección 16.5). This is the only file with raw design values.
// `light`, `dark`, `lightExtras`, `darkExtras`, `radius`, `space`, `type`, `motion` and `textExtras` are a verbatim
// copy of section 16.5. Tints and edges are the same mixes the web gets with `color-mix` (manual 2.3).

export const light = {
  bg:'#FAF7F1', surface:'#FFFFFF', surface2:'#F2EFE8', text:'#10252B', text2:'#5E6B70',
  border:'#E2E6E3', borderStrong:'#8A9699', accent:'#F46935', accentPressed:'#DB5626', accentText:'#B83F14', onAccent:'#10252B',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#2B8F62', limited:'#B7801F', reserved:'#4E66C9', busy:'#6E7C80',
  inactive:'#8A9699', error:'#C8453A', info:'#1D5661', inverseBg:'#103B46', inverseText:'#FAF7F1', inverseAccent:'#FF8456',
  // v2.0: mezclas de la paleta (tinte 18% y borde 45% sobre surface), selección
  selection:'#DB5626', tintOk:'#D9EBE3', tintReserved:'#DFE3F5', tintBusy:'#E5E7E8', tintLimited:'#F2E8D7',
  edgeOk:'#A0CDB8', edgeReserved:'#AFBAE7', edgeBusy:'#BEC4C6', edgeLimited:'#DFC69A',
  // Mobile v3 (diseño definitivo B + C, 11 nov): Arena, captions over the room light, the code well and «Cancelar reserva».
  sand:'#EFEAE0', caption:'#44535A', well:'#F5F1E8', dangerText:'#A93328',
};
export const dark: typeof light = {
  bg:'#0B2D36', surface:'#103B46', surface2:'#164853', text:'#FAF7F1', text2:'#A9BDC0',
  border:'#24525D', borderStrong:'#5E8A93', accent:'#FF8456', accentPressed:'#F46935', accentText:'#FF8456', onAccent:'#0B2D36',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#3FBF86', limited:'#E0A93B', reserved:'#8DA2F0', busy:'#8DA0A4',
  inactive:'#6F8C92', error:'#FF7B6E', info:'#7FC1CB', inverseBg:'#FAF7F1', inverseText:'#10252B', inverseAccent:'#B83F14',
  // v2.0: tinte 22% y borde 50% sobre surface
  selection:'#FF8456', tintOk:'#1A5854', tintReserved:'#2C526B', tintBusy:'#2C515B', tintLimited:'#3E5344',
  edgeOk:'#287D66', edgeReserved:'#4F6F9B', edgeBusy:'#4F6E75', edgeLimited:'#787241',
  // Mobile v3: Relieve, captions, the code well (Noche) and «Cancelar reserva».
  sand:'#164853', caption:'#C5D5D8', well:'#0B2D36', dangerText:'#FF8F84',
};
export const lightExtras = {
  overlay:'rgba(11,45,54,.55)', focusRing:'rgba(244,105,53,.45)',
  glassBg:'rgba(255,255,255,.70)', glassBorder:'rgba(255,255,255,.65)',
  glassPanel:'rgba(255,255,255,.50)', glassBar:'rgba(250,247,241,.85)', glassSolid:'rgba(255,255,255,.92)',
  shadowSoft:'0 1px 2px rgba(16,37,43,.05), 0 10px 28px -12px rgba(16,37,43,.18)',
  shadowFloat:'0 12px 32px -12px rgba(16,37,43,.28)',
  // Mobile v3 map «en tonos de papel»: blocks, the streets between them, roads, avenues, parks, water and labels.
  mapGround:'#F7F3EA', mapBlock:'#F7F3EA', mapPark:'#D6E4D0', mapWater:'#CBDFE3', mapAvenue:'#FFFDF8',
  mapRoad:'#FFFDF8', mapRoadEdge:'#E4DDD0', mapLabel:'#8C8676', mapFrame:'#FFFFFF', mapFade:'#EFE9DD',
  // Room light of the web dashboard (`--amb-warm` / `--amb-cool` in the web tokens): color + its opacity at the center.
  ambWarm:'#F46935', ambWarmOpacity:0.55, ambCool:'#103B46', ambCoolOpacity:0.42,
  // Mobile v3 room light on every diner screen (orange top-left, petrol bottom-right), opacity at the corner.
  glowWarmOpacity:0.42, glowCool:'#103B46', glowCoolOpacity:0.40,
  // Mobile v3 pieces: matte surfaces with soft shadows, never blur.
  shadowRaised:'0 1px 2px rgba(16,37,43,.06), 0 10px 22px -12px rgba(16,37,43,.3)',
  shadowCard:'0 -8px 36px -12px rgba(16,37,43,.35)',
  shadowTicket:'0 1px 2px rgba(16,37,43,.05), 0 26px 46px -26px rgba(16,37,43,.38)',
  shadowStats:'0 1px 2px rgba(16,37,43,.05), 0 14px 28px -18px rgba(16,37,43,.25)',
  shadowMap:'0 1px 2px rgba(16,37,43,.06), 0 22px 44px -22px rgba(16,37,43,.30)',
  shadowAccent:'0 14px 28px -12px rgba(244,105,53,.7)',
  shadowWell:'inset 0 2px 4px rgba(16,37,43,.13)',
  searchTrack:'rgba(255,255,255,.6)', softButton:'#F2EFE8', ringTrack:'rgba(16,37,43,.08)',
  notchStart:'#F8EFE6', notchEnd:'#F1EFEA', ticketRule:'#E2DDD0', avatar:'#FFFFFF',
  markerBg:'#FFFFFF', markerSelectedBg:'#10252B', markerSelectedText:'#FAF7F1', markerSelectedDot:'#3FBF86',
  markerGlow:0, userDotBorder:'#FFFFFF', segmentIdle:'#44535A',
  // Glass of the web dashboard (`--glass-card-bg`, `--glass-edge`, `--glass-sheen`): cards over the room light.
  glassCard:'rgba(255,255,255,.72)', glassEdge:'rgba(255,255,255,.62)', glassSheen:'inset 0 1px 0 rgba(255,255,255,.7)',
  overMapBg:'#FFFFFF', overMapShadow:'0 1px 2px rgba(16,37,43,.06), 0 10px 22px -12px rgba(16,37,43,.3)',
};
export const darkExtras: typeof lightExtras = {
  overlay:'rgba(0,0,0,.6)', focusRing:'rgba(255,132,86,.55)',
  glassBg:'rgba(16,59,70,.62)', glassBorder:'rgba(255,255,255,.16)',
  glassPanel:'rgba(16,59,70,.50)', glassBar:'rgba(11,45,54,.85)', glassSolid:'rgba(16,59,70,.92)',
  shadowSoft:'0 1px 2px rgba(0,0,0,.25), 0 10px 28px -12px rgba(0,0,0,.5)',
  shadowFloat:'0 12px 32px -12px rgba(0,0,0,.6)',
  // Mobile v3 night map: the tables are the lights.
  mapGround:'#0F3944', mapBlock:'#0F3944', mapPark:'#12493F', mapWater:'#0E4B5A', mapAvenue:'#2A6D7A',
  mapRoad:'#236270', mapRoadEdge:'#17505C', mapLabel:'#7FB0B8', mapFrame:'#164853', mapFade:'#0B2D36',
  ambWarm:'#F46935', ambWarmOpacity:0.34, ambCool:'#1C6A6E', ambCoolOpacity:0.55,
  glowWarmOpacity:0.34, glowCool:'#1C6A6E', glowCoolOpacity:0.6,
  shadowRaised:'inset 0 1px 0 rgba(255,255,255,.08)',
  shadowCard:'inset 0 1px 0 rgba(255,255,255,.09), 0 -10px 40px -10px rgba(0,0,0,.55)',
  shadowTicket:'inset 0 1px 0 rgba(255,255,255,.09), 0 28px 50px -24px rgba(0,0,0,.7)',
  shadowStats:'inset 0 1px 0 rgba(255,255,255,.08)',
  shadowMap:'0 24px 46px -22px rgba(0,0,0,.7)',
  shadowAccent:'0 14px 30px -12px rgba(255,132,86,.6)',
  shadowWell:'inset 0 2px 4px rgba(0,0,0,.4)',
  searchTrack:'rgba(250,247,241,.12)', softButton:'rgba(250,247,241,.10)', ringTrack:'rgba(250,247,241,.12)',
  notchStart:'#10323A', notchEnd:'#0D3640', ticketRule:'#2C5F6B', avatar:'#164853',
  markerBg:'rgba(11,45,54,.9)', markerSelectedBg:'#FAF7F1', markerSelectedText:'#10252B', markerSelectedDot:'#2B8F62',
  markerGlow:1, userDotBorder:'#FAF7F1', segmentIdle:'#E6EEEE',
  glassCard:'rgba(16,59,70,.72)', glassEdge:'rgba(255,255,255,.10)', glassSheen:'inset 0 1px 0 rgba(255,255,255,.08)',
  overMapBg:'rgba(11,45,54,.82)', overMapShadow:'inset 0 0 0 1px rgba(250,247,241,.14)',
};
export const radius = { card:20, tile:16, btn:14, input:12, sheet:28, chip:999, piece:24, panel:28, ticket:32, frame:36 };
export const space = { 1:4, 2:8, 3:12, 4:16, 5:24, 6:32, 7:48 };
export const type = {
  display:{ fontSize:48, lineHeight:52, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-1.44 },
  h1:{ fontSize:28, lineHeight:32, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-0.7 },
  h2:{ fontSize:22, lineHeight:28, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.33 },
  h3:{ fontSize:18, lineHeight:24, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.18 },
  body:{ fontSize:16, lineHeight:24, fontFamily:'PlusJakartaSans_500Medium' },
  sec:{ fontSize:14, lineHeight:20, fontFamily:'PlusJakartaSans_500Medium' },
  label:{ fontSize:12, lineHeight:16, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:0.12 },
  kicker:{ fontSize:11, lineHeight:14, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:0.88, textTransform:'uppercase' as const },
  metric:{ fontSize:28, lineHeight:32, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-0.84, fontVariant:['tabular-nums'] as const },
  figure:{ fontSize:54, lineHeight:54, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-2.16, fontVariant:['tabular-nums'] as const },
};
export const motion = {
  press:120, fast:150, base:200, slow:300, highlight:700,
  easing:[0.2,0.8,0.2,1] as const,          // --ease
  enter:[0.23,1,0.32,1] as const,           // --ease-enter
  move:[0.77,0,0.175,1] as const,           // --ease-move
  sheet:[0.32,0.72,0,1] as const,           // --ease-sheet
  pressScale:0.97,
  spring:{ snappy:{ duration:350, dampingRatio:0.9 }, gentle:{ duration:500, dampingRatio:0.8 } },
};
export const textExtras = {
  button:{ fontSize:15, lineHeight:20, fontFamily:'PlusJakartaSans_700Bold' },
  fieldLabel:{ fontSize:14, lineHeight:20, fontFamily:'PlusJakartaSans_700Bold' },
  chip:{ fontSize:12, lineHeight:16, fontFamily:'PlusJakartaSans_700Bold' },
};

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof light & typeof lightExtras;

export const themes: Record<ColorScheme, ThemeColors> = {
  light: { ...light, ...lightExtras },
  dark: { ...dark, ...darkExtras },
};

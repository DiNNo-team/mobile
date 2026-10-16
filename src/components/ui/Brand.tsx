import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

import {
  LOGO_LETTER_D,
  LOGO_LETTERS_NNO,
  LOGO_PIN_OFFSET,
  LOGO_VIEWBOX,
  SYMBOL_DOT,
  SYMBOL_PIN,
  SYMBOL_STEM,
  SYMBOL_STROKE,
  SYMBOL_VIEWBOX,
} from './brand-paths';

const LOGO_RATIO = 351.4 / 119;
const SYMBOL_RATIO = 44 / 64;
/** The stem of the "i" inside the logo is longer than the standalone symbol's. */
const LOGO_STEM_HEIGHT = 50;

/**
 * DiNNo logo (manual 1): "Di" and the pin in ink, "NNo" and the Active Dot in orange. In dark mode they
 * become cream and night orange by themselves (they read `text` and `accent`). Minimum width 72.
 */
export function Logo({ width = 128 }: { width?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={width} height={width / LOGO_RATIO} viewBox={LOGO_VIEWBOX} accessibilityLabel="DiNNo" accessibilityRole="image">
      <Path d={LOGO_LETTER_D} fill={colors.text} />
      <G transform={`translate(${LOGO_PIN_OFFSET.x} ${LOGO_PIN_OFFSET.y})`}>
        <Rect {...SYMBOL_STEM} height={LOGO_STEM_HEIGHT} fill={colors.text} />
        <Path d={SYMBOL_PIN} fill="none" stroke={colors.text} strokeWidth={SYMBOL_STROKE} strokeLinecap="round" strokeLinejoin="round" />
        <Circle {...SYMBOL_DOT} fill={colors.accent} />
      </G>
      {LOGO_LETTERS_NNO.map((d) => (
        <Path key={d} d={d} fill={colors.accent} />
      ))}
    </Svg>
  );
}

export interface BrandSymbolProps {
  height?: number;
  /** `brand`: pin in ink/cream with the orange Active Dot. `outline`: everything in secondary text (empty states). */
  variant?: 'brand' | 'outline';
}

/** The pin with the Active Dot alone (manual 1). Empty states use the outline version at 48. */
export function BrandSymbol({ height = 48, variant = 'brand' }: BrandSymbolProps) {
  const { colors } = useTheme();
  const ink = variant === 'outline' ? colors.text2 : colors.text;
  const dot = variant === 'outline' ? colors.text2 : colors.accent;
  return (
    <Svg width={height * SYMBOL_RATIO} height={height} viewBox={SYMBOL_VIEWBOX} accessibilityElementsHidden importantForAccessibility="no">
      <Rect {...SYMBOL_STEM} fill={ink} />
      <Path d={SYMBOL_PIN} fill="none" stroke={ink} strokeWidth={SYMBOL_STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Circle {...SYMBOL_DOT} fill={dot} />
    </Svg>
  );
}

import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

export interface AmbientGroundProps {
  /**
   * `room` (default): the web dashboard's geometry, used by the login. `screen`: mobile v3 (diseño definitivo), the
   * light of every diner screen, `radial-gradient(90% 40% at 0 0)` orange and `(90% 46% at 100% 100%)` petrol, both
   * fading out at 72%.
   */
  variant?: 'room' | 'screen';
  /** Only the two lights, without the page ground: laid over something already drawn (the detail's map). */
  overlay?: boolean;
}

/**
 * The room light of the web dashboard (`AmbientGround`, `amb-open` in the web globals.css) on a phone: the page ground
 * with two soft lights, orange from the top-left corner and petrol from the bottom-right one. It is a gradient of its
 * own, never a blur, so Android draws it the same as iOS. Static: it never animates.
 */
export function AmbientGround({ variant = 'room', overlay = false }: AmbientGroundProps) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const vmax = Math.max(width, height) / 100;
  const screen = variant === 'screen';

  const warm = screen
    ? { cx: 0, cy: 0, rx: width * 0.9, ry: height * 0.4, opacity: colors.glowWarmOpacity, end: 0.72 }
    : { cx: width * 0.06, cy: height * -0.14, rx: 68 * vmax, ry: 56 * vmax, opacity: colors.ambWarmOpacity, end: 0.66 };
  const cool = screen
    ? { cx: width, cy: height, rx: width * 0.9, ry: height * 0.46, opacity: colors.glowCoolOpacity, end: 0.72, color: colors.glowCool }
    : { cx: width * 1.08, cy: height * 1.12, rx: 78 * vmax, ry: 66 * vmax, opacity: colors.ambCoolOpacity, end: 0.64, color: colors.ambCool };

  return (
    <Svg width={width} height={height} style={[StyleSheet.absoluteFill, overlay ? null : { backgroundColor: colors.bg }]} pointerEvents="none">
      <Defs>
        <RadialGradient id="amb-warm" gradientUnits="userSpaceOnUse" cx={warm.cx} cy={warm.cy} fx={warm.cx} fy={warm.cy} rx={warm.rx} ry={warm.ry}>
          <Stop offset={0} stopColor={colors.ambWarm} stopOpacity={warm.opacity} />
          <Stop offset={warm.end} stopColor={colors.ambWarm} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="amb-cool" gradientUnits="userSpaceOnUse" cx={cool.cx} cy={cool.cy} fx={cool.cx} fy={cool.cy} rx={cool.rx} ry={cool.ry}>
          <Stop offset={0} stopColor={cool.color} stopOpacity={cool.opacity} />
          <Stop offset={cool.end} stopColor={cool.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#amb-warm)" />
      <Rect width={width} height={height} fill="url(#amb-cool)" />
    </Svg>
  );
}

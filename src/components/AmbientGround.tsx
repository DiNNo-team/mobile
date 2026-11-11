import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * The room light of the web dashboard (`AmbientGround`, `amb-open` in the web globals.css) on a phone: the page ground
 * with two soft lights, orange from the top-left corner and petrol from the bottom-right one. Same geometry as the web
 * radial gradients (sizes in vmax, fade to transparent at 66% and 64%). Static: it never animates.
 */
export function AmbientGround() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const vmax = Math.max(width, height) / 100;

  return (
    <Svg width={width} height={height} style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} pointerEvents="none">
      <Defs>
        <RadialGradient
          id="amb-warm"
          gradientUnits="userSpaceOnUse"
          cx={width * 0.06}
          cy={height * -0.14}
          fx={width * 0.06}
          fy={height * -0.14}
          rx={68 * vmax}
          ry={56 * vmax}
        >
          <Stop offset={0} stopColor={colors.ambWarm} stopOpacity={colors.ambWarmOpacity} />
          <Stop offset={0.66} stopColor={colors.ambWarm} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          id="amb-cool"
          gradientUnits="userSpaceOnUse"
          cx={width * 1.08}
          cy={height * 1.12}
          fx={width * 1.08}
          fy={height * 1.12}
          rx={78 * vmax}
          ry={66 * vmax}
        >
          <Stop offset={0} stopColor={colors.ambCool} stopOpacity={colors.ambCoolOpacity} />
          <Stop offset={0.64} stopColor={colors.ambCool} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#amb-warm)" />
      <Rect width={width} height={height} fill="url(#amb-cool)" />
    </Svg>
  );
}

import { useId } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export interface EdgeFadeProps {
  /** The color it fades from (top) to transparent (bottom), or the other way with `direction="up"`. */
  color: string;
  height: number;
  direction?: 'down' | 'up';
  /** 0–1. Down: where the solid color ends. Up: where it starts (the detail's map is solid from 78%). */
  solidAt?: number;
  style?: StyleProp<ViewStyle>;
}

/** Mobile v3: a gradient that melts the map into the ground (the top of the frame, the detail's map). Decorative. */
export function EdgeFade({ color, height, direction = 'down', solidAt, style }: EdgeFadeProps) {
  const id = `fade-${useId().replace(/:/g, '')}`;
  // Down: solid from the top to `solidAt`, then fading. Up: fading from the top, solid from `solidAt` on.
  const solid = solidAt ?? (direction === 'down' ? 0 : 1);
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ height }, style]}>
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
            <Stop offset={direction === 'down' ? solid : 0} stopColor={color} stopOpacity={direction === 'down' ? 1 : 0} />
            <Stop offset={direction === 'down' ? 1 : solid} stopColor={color} stopOpacity={direction === 'down' ? 0 : 1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

export interface CountdownRingProps {
  /** 0–1: the part of the time still left. The ring consumes itself continuously as it goes down. */
  progress: number;
  /** 172 in the ticket. */
  size?: number;
  stroke?: number;
  /** What sits in the middle («Quedan» + 12:34). */
  children: ReactNode;
  accessibilityLabel?: string;
}

/** Mobile v3: the reservation's circular timer, an orange ring over a faint track that starts at 12 o'clock. */
export function CountdownRing({ progress, size = 172, stroke = 10, children, accessibilityLabel }: CountdownRingProps) {
  const { colors, scheme } = useTheme();
  const radius = size / 2 - stroke;
  const center = size / 2;
  const length = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center self-center"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={center} cy={center} r={radius} fill={scheme === 'dark' ? colors.bg : colors.surface} stroke={colors.ringTrack} strokeWidth={stroke} />
        {clamped > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${length * clamped} ${length}`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Availability } from '@/features/search/types';
import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { getAvailabilityPresentation, type StatusColor } from './status';
import { StatusShape } from './StatusShape';

const markerBorder: Record<StatusColor, string> = {
  ok: 'border-ok',
  limited: 'border-limited',
  busy: 'border-busy',
  inactive: 'border-inactive',
};

export interface AvailabilityMarkerProps {
  availability: Availability;
  /** Selected restaurant: bigger, with the orange selection border (manual 0.2). */
  selected?: boolean;
}

/**
 * Map pin of a restaurant: the availability shape inside a solid badge, never a generic pin (manual 0.3 and 8).
 * It is a plain view: the map screen renders it inside its marker. Same color + shape as the chip.
 */
export function AvailabilityMarker({ availability, selected = false }: AvailabilityMarkerProps) {
  const { colors } = useTheme();
  const status = getAvailabilityPresentation(availability);
  return (
    <View
      accessible
      accessibilityLabel={status.label}
      className={cn(
        'items-center justify-center rounded-chip bg-surface',
        selected ? 'h-11 w-11 border-3 border-accent' : cn('h-8 w-8 border-2', markerBorder[status.color]),
      )}
      style={{ boxShadow: selected ? colors.shadowFloat : colors.shadowSoft }}
    >
      <StatusShape shape={status.shape} color={status.color} size={selected ? 18 : 14} />
    </View>
  );
}

/** Waves grow ×3.3 from the 16 dot (fits the 56 box) and fade (Active Dot, manual 13.1). */
const WAVE_SCALE = 3.3;
const WAVE_MS = 1400;
const WAVE_GAP_MS = 700;

function RadarWave({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: WAVE_MS, easing: Easing.out(Easing.ease) }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + (WAVE_SCALE - 1) * progress.value }],
  }));

  return <Animated.View className="absolute h-4 w-4 rounded-chip bg-accent" style={style} />;
}

/**
 * The diner's position: orange Active Dot with two radar waves (decision of 15 oct). With reduced motion
 * it shows a still halo instead.
 */
export function UserLocationMarker() {
  const reduceMotion = useReducedMotion();
  return (
    <View
      accessible
      accessibilityLabel="Tu ubicación"
      className="h-14 w-14 items-center justify-center"
    >
      {reduceMotion ? (
        <View className="absolute h-8 w-8 rounded-chip bg-accent/20" />
      ) : (
        <>
          <RadarWave delay={0} />
          <RadarWave delay={WAVE_GAP_MS} />
        </>
      )}
      <View className="h-4 w-4 rounded-chip border-2 border-surface bg-accent" />
    </View>
  );
}


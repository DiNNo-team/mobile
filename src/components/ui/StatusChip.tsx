import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Availability } from '@/features/search/types';
import { cn } from '@/lib/cn';

import { getAvailabilityPresentation, OPEN_STATUS_PRESENTATION, type StatusColor, type StatusPresentation } from './status';
import { StatusShape } from './StatusShape';
import { Text } from './Text';

const chipBackground: Record<StatusColor, string> = {
  ok: 'bg-ok/15',
  limited: 'bg-limited/15',
  busy: 'bg-busy/15',
  inactive: 'bg-inactive/15',
};

const PULSE_HALF_MS = 1000;

/** Soft opacity pulse 1 → .35 every 2 s (manual 13.2), still with reduced motion. */
function LiveShape({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.35, { duration: PULSE_HALF_MS }), -1, true);
    return () => cancelAnimation(opacity);
  }, [reduceMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

export interface StatusChipProps {
  status: StatusPresentation;
  className?: string;
}

/** Pill 24 tall, background 15% of the state color, shape 8 + word 12/16 700 (manual 3 and 9). */
export function StatusChip({ status, className }: StatusChipProps) {
  const shape = <StatusShape shape={status.shape} color={status.color} />;
  return (
    <View
      accessible
      accessibilityLabel={status.label}
      className={cn('h-6 flex-row items-center gap-1.5 self-start rounded-chip px-2.5', chipBackground[status.color], className)}
    >
      {status.live ? <LiveShape>{shape}</LiveShape> : shape}
      <Text variant="chip">{status.label}</Text>
    </View>
  );
}

/** Availability for the diner: Disponible · Pocas mesas · Sin mesas · Cerrado. */
export function AvailabilityChip({ availability, className }: { availability: Availability; className?: string }) {
  return <StatusChip status={getAvailabilityPresentation(availability)} className={className} />;
}

/** Operating state in the detail: Abierto (live dot) · Cerrado (dash). */
export function OpenStatusChip({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return <StatusChip status={OPEN_STATUS_PRESENTATION[isOpen ? 'open' : 'closed']} className={className} />;
}


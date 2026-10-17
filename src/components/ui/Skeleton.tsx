import { useEffect, useState } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

const PULSE_HALF_MS = 600;
/** Loads faster than this show nothing (manual 11.1). */
export const SKELETON_DELAY_MS = 300;

export interface SkeletonProps {
  /** Size and radius of the real element: `h-6 w-32 rounded-chip`, `h-24 rounded-card`. */
  className: string;
}

/** Loading block (manual 9): `surface-2` with the real element's radius, opacity pulse of 1.2 s. */
export function Skeleton({ className }: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.5, { duration: PULSE_HALF_MS }), -1, true);
    return () => cancelAnimation(opacity);
  }, [reduceMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View className={cn('bg-surface-2', className)} style={style} />;
}

/**
 * False for the first 300 ms of a load, so quick loads do not flash a skeleton. With another `delayMs` it
 * also tells when something takes too long ("Conectando con DiNNo…" after 5 s).
 */
export function useDelayedLoading(loading: boolean, delayMs: number = SKELETON_DELAY_MS): boolean {
  const [visible, setVisible] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);

  // A new load starts hidden again.
  if (loading !== wasLoading) {
    setWasLoading(loading);
    if (!loading) setVisible(false);
  }

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [loading, delayMs]);

  return loading && visible;
}

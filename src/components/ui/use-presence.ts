import { useEffect, useState } from 'react';
import {
  Easing,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { motion } from '@/theme/tokens';

const ease = Easing.bezier(...motion.easing);

/**
 * Keeps an overlay mounted while it animates out. `progress` goes 0 → 1 on show and back to 0 on hide;
 * with reduced motion it jumps to the final state (manual 13.2).
 */
export function usePresence(visible: boolean, duration: number = motion.slow): { mounted: boolean; progress: SharedValue<number> } {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  // Mount right away when shown; unmount only after the exit animation ends.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: reduceMotion ? 0 : duration, easing: ease });
    } else {
      progress.value = withTiming(0, { duration: reduceMotion ? 0 : motion.base, easing: ease }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible, reduceMotion, duration, progress]);

  return { mounted, progress };
}

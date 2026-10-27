import { Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

const enter = Easing.bezier(...motion.enter);

/**
 * Press feedback (manual 11.3): the pressed element sinks to 0.97 in 120 ms and comes back in 150 ms, on the UI
 * thread. With reduced motion it does not scale (the pressed color still shows).
 */
export function usePressScale(scale: number = motion.pressScale) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, reduceMotion ? 1 : scale]) }],
  }));

  return {
    style,
    onPressIn: () => {
      pressed.set(withTiming(1, { duration: motion.press, easing: enter }));
    },
    onPressOut: () => {
      pressed.set(withTiming(0, { duration: motion.fast, easing: enter }));
    },
  };
}

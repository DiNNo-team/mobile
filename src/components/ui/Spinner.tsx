import { LoaderCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type IconColor } from './Icon';

const TURN_MS = 800;

/** `loader-circle` spinning (manual 9): only inside buttons or small areas, never full screen. */
export function Spinner({ size = 16, color = 'text' }: { size?: 16 | 20; color?: IconColor }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    rotation.value = withRepeat(withTiming(360, { duration: TURN_MS, easing: Easing.linear }), -1);
    return () => cancelAnimation(rotation);
  }, [reduceMotion, rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Animated.View style={style} accessibilityRole="progressbar" accessibilityLabel="Cargando">
      <Icon icon={LoaderCircle} size={size} color={color} />
    </Animated.View>
  );
}

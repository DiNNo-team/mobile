import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { usePressScale } from './use-press-scale';

export interface CardProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode;
  /** Selected (the restaurant highlighted on the map): 2 px selection border. */
  selected?: boolean;
  /** `card` 20 (default) or `tile` 16 for compact cards. */
  shape?: 'card' | 'tile';
  /**
   * `resting` (default): level 1, border only (manual 6.3). `floating`: over the map, with the floating shadow
   * (manual 7, solid fallback of the glass: Android cannot blur the Google map behind it).
   */
  elevation?: 'resting' | 'floating';
  /** Layout only (margins, width). */
  className?: string;
}

/**
 * Card (manual 12.2): surface and 1 px border, no shadow at rest; padding 16 on mobile. Pressable when it gets
 * `onPress` (sinks to 0.98). Never put another Card inside.
 */
export function Card({ children, selected = false, shape = 'card', elevation = 'resting', onPress, disabled, className, ...props }: CardProps) {
  const { colors } = useTheme();
  const press = usePressScale(0.98);
  const shadow = elevation === 'floating' ? colors.shadowFloat : undefined;
  const frame = cn(
    'bg-surface p-4',
    shape === 'card' ? 'rounded-card' : 'rounded-tile',
    selected ? 'border-2 border-selection' : 'border border-line',
  );

  if (!onPress) {
    return (
      <View className={cn(frame, className)} style={{ boxShadow: shadow }}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={disabled}
      className={className}
      {...props}
    >
      {({ pressed }) => (
        <Animated.View className={cn(frame, pressed && 'bg-surface-2')} style={[{ boxShadow: shadow }, press.style]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}

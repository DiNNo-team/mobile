import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

export interface CardProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode;
  /** Selected (the restaurant highlighted on the map): 2 px orange border. */
  selected?: boolean;
  /** `card` 20 (default) or `tile` 16 for compact cards. */
  shape?: 'card' | 'tile';
  /**
   * `floating`: over the map (manual 7, solid fallback of the glass: surface, soft border, floating shadow).
   * Android cannot blur the Google map behind it, so the app always uses this fallback.
   */
  elevation?: 'soft' | 'floating';
  /** Layout only (margins, width). */
  className?: string;
}

/**
 * Card (manual 6 and 9): surface, 1 px border, soft shadow, padding 16 on mobile. Pressable when it gets
 * `onPress`. Never put another Card inside.
 */
export function Card({ children, selected = false, shape = 'card', elevation = 'soft', onPress, disabled, className, ...props }: CardProps) {
  const { colors } = useTheme();
  const shadow = elevation === 'floating' ? colors.shadowFloat : colors.shadowSoft;
  const frame = cn(
    'bg-surface p-4',
    shape === 'card' ? 'rounded-card' : 'rounded-tile',
    selected ? 'border-2 border-accent' : 'border border-line',
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
      disabled={disabled}
      className={className}
      {...props}
    >
      {({ pressed }) => (
        <View className={cn(frame, pressed && 'bg-surface-2')} style={{ boxShadow: pressed ? undefined : shadow }}>
          {children}
        </View>
      )}
    </Pressable>
  );
}

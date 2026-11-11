import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { Icon, type IconColor } from './Icon';
import { usePressScale } from './use-press-scale';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: LucideIcon;
  /** Required: says what the button does for screen readers ("Cerrar", "Ver contraseña"). */
  accessibilityLabel: string;
  color?: IconColor;
  /** `surface`: solid background, for buttons floating over the map or a photo. */
  background?: 'none' | 'surface';
  /**
   * Mobile v3: `raised` is the 48 round «Volver» (Loza with a soft shadow in light, Petróleo in dark); `overMap` is the
   * same button over the night map (Noche at 82% with a thin cream ring in dark).
   */
  variant?: 'square' | 'raised' | 'overMap';
  className?: string;
}

/** Icon-only button (manual 6.1 and 9): 44 × 44 touch target, radius 12, icon 20. */
export function IconButton({ icon, color = 'text', background = 'none', variant = 'square', disabled, className, ...props }: IconButtonProps) {
  const press = usePressScale();
  const { colors } = useTheme();
  if (variant !== 'square') {
    const round =
      variant === 'overMap'
        ? { backgroundColor: colors.overMapBg, boxShadow: colors.overMapShadow }
        : { backgroundColor: colors.surface, boxShadow: colors.shadowRaised };
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        className={cn('self-start', className)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        {...props}
      >
        <Animated.View style={[press.style, round]} className={cn('h-12 w-12 items-center justify-center rounded-chip', disabled && 'opacity-45')}>
          <Icon icon={icon} size={22} color={color} strokeWidth={2.2} />
        </Animated.View>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn('self-start', className)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      {...props}
    >
      {({ pressed }) => (
        <Animated.View
          style={press.style}
          className={cn(
            'h-11 w-11 items-center justify-center rounded-input',
            background === 'surface' ? 'border border-line' : '',
            pressed && !disabled ? 'bg-surface-2' : background === 'surface' ? 'bg-surface' : 'bg-transparent',
            disabled && 'opacity-45',
          )}
        >
          <Icon icon={icon} color={color} />
        </Animated.View>
      )}
    </Pressable>
  );
}

import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconColor } from './Icon';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: LucideIcon;
  /** Required: says what the button does for screen readers ("Cerrar", "Ver contraseña"). */
  accessibilityLabel: string;
  color?: IconColor;
  /** `surface`: solid background, for buttons floating over the map or a photo. */
  background?: 'none' | 'surface';
  className?: string;
}

/** Icon-only button (manual 6.1 and 9): 44 × 44 touch target, radius 12, icon 20. */
export function IconButton({ icon, color = 'text', background = 'none', disabled, className, ...props }: IconButtonProps) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} className={cn('self-start', className)} {...props}>
      {({ pressed }) => (
        <View
          className={cn(
            'h-11 w-11 items-center justify-center rounded-input',
            background === 'surface' ? 'border border-line' : '',
            pressed && !disabled ? 'bg-surface-2' : background === 'surface' ? 'bg-surface' : 'bg-transparent',
            disabled && 'opacity-45',
          )}
        >
          <Icon icon={icon} color={color} />
        </View>
      )}
    </Pressable>
  );
}

import { X, type LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { cn } from '@/lib/cn';

import { Icon } from './Icon';
import { Text } from './Text';
import { usePressScale } from './use-press-scale';

export interface FilterChipProps {
  label: string;
  /** Chosen option: orange border (selection, manual 0.2) and bold text. */
  selected?: boolean;
  onPress?: () => void;
  /** Active filter that can be removed: shows an `x` and calls this. */
  onRemove?: () => void;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Filter chip: options to choose (category) and active filters shown as chips with `x`.
 * Pill 36 tall with a 44 touch area.
 */
export function FilterChip({ label, selected = false, onPress, onRemove, icon, className }: FilterChipProps) {
  const removable = !!onRemove;
  const press = usePressScale();
  return (
    <Pressable
      accessibilityRole={removable ? 'button' : 'checkbox'}
      accessibilityLabel={removable ? `Quitar filtro ${label}` : label}
      accessibilityState={removable ? undefined : { checked: selected }}
      onPress={onRemove ?? onPress}
      hitSlop={4}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      className={cn('self-start', className)}
    >
      {({ pressed }) => (
        <Animated.View
          style={press.style}
          className={cn(
            'h-9 flex-row items-center gap-1.5 rounded-chip border-1.5 px-3',
            selected || removable ? 'border-selection' : 'border-line',
            pressed ? 'bg-surface-2' : 'bg-surface',
          )}
        >
          {icon ? <Icon icon={icon} size={16} color={selected || removable ? 'text' : 'text2'} /> : null}
          <Text variant={selected || removable ? 'chip' : 'sec'} tone={selected || removable ? 'default' : 'secondary'}>
            {label}
          </Text>
          {removable ? <Icon icon={X} size={16} /> : null}
        </Animated.View>
      )}
    </Pressable>
  );
}

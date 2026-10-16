import { X, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './Icon';
import { Text } from './Text';

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
  return (
    <Pressable
      accessibilityRole={removable ? 'button' : 'checkbox'}
      accessibilityLabel={removable ? `Quitar filtro ${label}` : label}
      accessibilityState={removable ? undefined : { checked: selected }}
      onPress={onRemove ?? onPress}
      hitSlop={4}
      className={cn('self-start', className)}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'h-9 flex-row items-center gap-1.5 rounded-chip border-1.5 px-3',
            selected || removable ? 'border-accent' : 'border-line',
            pressed ? 'bg-surface-2' : 'bg-surface',
          )}
        >
          {icon ? <Icon icon={icon} size={16} color={selected || removable ? 'text' : 'text2'} /> : null}
          <Text variant={selected || removable ? 'chip' : 'sec'} tone={selected || removable ? 'default' : 'secondary'}>
            {label}
          </Text>
          {removable ? <Icon icon={X} size={16} /> : null}
        </View>
      )}
    </Pressable>
  );
}

import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Read by screen readers for the whole group: "Distancia", "Tema". */
  accessibilityLabel: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Segmented control (manual 9): 44 tall, `surface-2` track with padding 4, radius 14; the active segment is
 * white with a soft shadow and bold text. Not orange: it is a choice, not an action.
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={cn('h-11 flex-row rounded-btn bg-surface-2 p-1', disabled && 'opacity-45', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            className={cn('flex-1 items-center justify-center rounded-input', active && 'bg-surface')}
            style={active ? { boxShadow: colors.shadowSoft } : undefined}
          >
            <Text variant={active ? 'button' : 'sec'} tone={active ? 'default' : 'secondary'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

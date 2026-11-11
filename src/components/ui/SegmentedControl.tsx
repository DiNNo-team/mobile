import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { selectionHaptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { type } from '@/theme/tokens';

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
  /**
   * `track` (default, manual 9) or `pill` (mobile v3, Explorar's «Mapa · Lista»): a 44 pill on the room light whose
   * active segment is ink in light and cream in dark. `segmentWidth` fixes each segment (66 in Explorar).
   */
  variant?: 'track' | 'pill';
  segmentWidth?: number;
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
  variant = 'track',
  segmentWidth,
  className,
}: SegmentedControlProps<T>) {
  const { colors, scheme } = useTheme();
  if (variant === 'pill') {
    // Active: Tinta with Crema text in light, Crema with Tinta text in dark. Inactive: the caption color.
    const activeText = scheme === 'dark' ? colors.inverseText : colors.bg;
    const idleText = colors.segmentIdle;
    return (
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        className={cn('h-11 flex-row gap-0.5 self-start rounded-chip p-1', disabled && 'opacity-45', className)}
        style={{ backgroundColor: colors.searchTrack }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled }}
              disabled={disabled}
              onPress={() => {
                if (!active) selectionHaptic();
                onChange(option.value);
              }}
              className={cn('h-9 items-center justify-center rounded-chip px-3', active && 'bg-fg')}
              style={segmentWidth ? { width: segmentWidth } : undefined}
            >
              <Text
                variant="small"
                numberOfLines={1}
                style={{ color: active ? activeText : idleText, fontFamily: active ? type.display.fontFamily : undefined }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
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

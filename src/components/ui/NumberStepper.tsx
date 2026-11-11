import { Minus, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { selectionHaptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';

import { Icon } from './Icon';

import { IconButton } from './IconButton';
import { Text } from './Text';
import { usePressScale } from './use-press-scale';

export interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** What the number counts, for screen readers: "Personas". */
  accessibilityLabel: string;
  /** Text of the value: `(n) => n === 1 ? '1 persona' : \`${n} personas\``. */
  formatValue?: (value: number) => string;
  /**
   * `md` (default, manual 9) or `lg` (mobile v3, the reserve sheet): round 52 buttons at the edges and the number big in
   * the middle, with `unit` under it («personas»).
   */
  size?: 'md' | 'lg';
  /** `lg` only: the word under the number, e.g. `(n) => n === 1 ? 'persona' : 'personas'`. */
  unit?: (value: number) => string;
  className?: string;
}

function RoundStep({ icon, label, disabled, onPress }: { icon: typeof Minus; label: string; disabled: boolean; onPress: () => void }) {
  const press = usePressScale();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        selectionHaptic();
        onPress();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View
        className={cn('h-[52px] w-[52px] items-center justify-center rounded-chip bg-surface dark:bg-sand', disabled && 'opacity-45')}
        style={[press.style, { boxShadow: colors.shadowRaised }]}
      >
        <Icon icon={icon} size={22} strokeWidth={2.2} />
      </Animated.View>
    </Pressable>
  );
}

/** Number with − / + (manual 9): 44 buttons, value in tabular figures. */
export function NumberStepper({
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
  formatValue = String,
  size = 'md',
  unit,
  className,
}: NumberStepperProps) {
  const text = formatValue(value);
  const change = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  if (size === 'lg') {
    return (
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value, text }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => change(event.nativeEvent.actionName === 'increment' ? value + 1 : value - 1)}
        className={cn('flex-row items-center justify-between', className)}
      >
        <RoundStep icon={Minus} label="Quitar uno" disabled={value <= min} onPress={() => change(value - 1)} />
        <View className="items-center">
          <Text variant="timer">{value}</Text>
          {unit ? (
            <Text variant="small" tone="caption">
              {unit(value)}
            </Text>
          ) : null}
        </View>
        <RoundStep icon={Plus} label="Agregar uno" disabled={value >= max} onPress={() => change(value + 1)} />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => change(event.nativeEvent.actionName === 'increment' ? value + 1 : value - 1)}
      className={cn('flex-row items-center gap-3 self-start', className)}
    >
      <IconButton
        icon={Minus}
        accessibilityLabel="Quitar uno"
        background="surface"
        disabled={value <= min}
        onPress={() => change(value - 1)}
      />
      <Text variant="h3" tabular className="min-w-24 text-center">
        {text}
      </Text>
      <IconButton
        icon={Plus}
        accessibilityLabel="Agregar uno"
        background="surface"
        disabled={value >= max}
        onPress={() => change(value + 1)}
      />
    </View>
  );
}

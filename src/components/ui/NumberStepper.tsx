import { Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { IconButton } from './IconButton';
import { Text } from './Text';

export interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** What the number counts, for screen readers: "Personas". */
  accessibilityLabel: string;
  /** Text of the value: `(n) => n === 1 ? '1 persona' : \`${n} personas\``. */
  formatValue?: (value: number) => string;
  className?: string;
}

/** Number with − / + (manual 9): 44 buttons, value in tabular figures. */
export function NumberStepper({ value, min, max, onChange, accessibilityLabel, formatValue = String, className }: NumberStepperProps) {
  const text = formatValue(value);
  const change = (next: number) => onChange(Math.min(max, Math.max(min, next)));

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

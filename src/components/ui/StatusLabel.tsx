import { View } from 'react-native';

import type { Availability } from '@/features/search/types';
import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { getAvailabilityPresentation, type StatusPresentation } from './status';
import { StatusShape } from './StatusShape';
import { Text } from './Text';

export interface StatusLabelProps {
  status: StatusPresentation;
  className?: string;
}

/**
 * Mobile v3 (diseño definitivo): the state written in the line, without a chip. Shape 10 with a 4 px halo of its own
 * color + word 14/700 («● Disponible» at the top of the editorial card and of the detail).
 */
export function StatusLabel({ status, className }: StatusLabelProps) {
  const { colors } = useTheme();
  const color = colors[status.color];
  return (
    <View accessible accessibilityLabel={status.label} className={cn('flex-row items-center gap-2', className)}>
      <View className="h-[18px] w-[18px] items-center justify-center rounded-chip" style={{ backgroundColor: `${color}33` }}>
        <StatusShape shape={status.shape} color={status.color} size={10} />
      </View>
      <Text variant="strong">{status.label}</Text>
    </View>
  );
}

/** Disponible · Pocas mesas · Sin mesas · Cerrado, written in the line. */
export function AvailabilityLabel({ availability, className }: { availability: Availability; className?: string }) {
  return <StatusLabel status={getAvailabilityPresentation(availability)} className={className} />;
}

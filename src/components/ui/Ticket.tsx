import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

/** Mobile v3: the reservation ticket, a matte panel of radius 32 (Loza in light, Petróleo in dark). */
export function Ticket({ children, className }: { children: ReactNode; className?: string }) {
  const { colors } = useTheme();
  return (
    <View className={cn('rounded-ticket bg-surface', className)} style={{ boxShadow: colors.shadowTicket }}>
      {children}
    </View>
  );
}

/** The tear line between the two halves of the ticket: two notches and a dashed rule. */
export function TicketDivider() {
  const { colors } = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="h-6 flex-row items-center">
      <View className="absolute -left-3 top-0 h-6 w-6 rounded-chip" style={{ backgroundColor: colors.notchStart }} />
      <View className="absolute -right-3 top-0 h-6 w-6 rounded-chip" style={{ backgroundColor: colors.notchEnd }} />
      <View className="mx-6 h-0 flex-1 border-t-2 border-dashed" style={{ borderColor: colors.ticketRule }} />
    </View>
  );
}

/** One cell per character of the code, sunk into the ticket (21/800, never cut). */
export function CodeCells({ code, accessibilityLabel }: { code: string; accessibilityLabel: string }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={accessibilityLabel} className="flex-row gap-1">
      {code.split('').map((char, index) => (
        <View key={index} className="h-11 flex-1 items-center justify-center rounded-input bg-well" style={{ boxShadow: colors.shadowWell }}>
          <Text variant="code">{char}</Text>
        </View>
      ))}
    </View>
  );
}

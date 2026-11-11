import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The web dashboard's `glass-card` on the phone: Loza (or Petróleo) at 72% with the glass edge and the top sheen, over
 * the room light. It needs no blur, so Android draws it the same as iOS; put it on a ground with light (a glass sheet,
 * `AmbientGround`), never over the Google map.
 */
export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  const { colors } = useTheme();
  return (
    <View
      className={cn('rounded-piece', className)}
      style={{ backgroundColor: colors.glassCard, borderWidth: 1, borderColor: colors.glassEdge, boxShadow: colors.glassSheen }}
    >
      {children}
    </View>
  );
}

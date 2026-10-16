import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

export interface FloatingSurfaceProps {
  children: ReactNode;
  /** `card` for the selected restaurant over the map, `chip` for floating filter pills. */
  shape?: 'card' | 'chip';
  className?: string;
}

/**
 * Container for controls that float over the map (manual 7): solid surface, soft border and floating shadow.
 * This is the manual's solid fallback; the frosted glass is added in phase 5 once it is checked against
 * the real map on Android (blur there needs the map wrapped in a blur target).
 */
export function FloatingSurface({ children, shape = 'card', className }: FloatingSurfaceProps) {
  const { colors } = useTheme();
  return (
    <View
      className={cn('border border-line bg-surface', shape === 'card' ? 'rounded-card p-4' : 'self-start rounded-chip px-3 py-1', className)}
      style={{ boxShadow: colors.shadowFloat }}
    >
      {children}
    </View>
  );
}

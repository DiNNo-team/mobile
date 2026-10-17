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
 * This is the manual's solid fallback, used on Android on purpose: blurring needs to capture the view behind,
 * and the Google map draws on its own native surface that the blur cannot read. Revisit for iPhone.
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

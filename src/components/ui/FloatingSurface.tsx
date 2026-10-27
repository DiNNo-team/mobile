import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { GlassSurface } from './GlassSurface';

export interface FloatingSurfaceProps {
  children: ReactNode;
  /** `card` for the selected restaurant over the map, `chip` for floating filter pills, `bar` for the floating header. */
  shape?: 'card' | 'chip' | 'bar';
  className?: string;
}

/**
 * Container for controls that float over the map (manual 7, map glass). iOS blurs the map behind it; Android uses the
 * solid fallback on purpose: blurring needs to capture the view behind, and the Google map draws on its own native
 * surface that the blur cannot read.
 */
export function FloatingSurface({ children, shape = 'card', className }: FloatingSurfaceProps) {
  return (
    <GlassSurface
      level="map"
      className={cn(
        shape === 'card' && 'rounded-card p-4',
        shape === 'bar' && 'rounded-card p-3',
        shape === 'chip' && 'self-start rounded-chip px-3 py-1',
        className,
      )}
    >
      {children}
    </GlassSurface>
  );
}

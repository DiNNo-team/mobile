import { View } from 'react-native';

import { cn } from '@/lib/cn';

export interface PageDotsProps {
  /** 0-based. */
  index: number;
  count: number;
  /** Read as «Restaurante 1 de 4». */
  itemLabel: string;
  /** Dashes drawn at most; the label still says the real total. */
  max?: number;
  className?: string;
}

/** Mobile v3: where the diner is in a row of cards, as 20 × 3 dashes (the current one in ink or cream). */
export function PageDots({ index, count, itemLabel, max = 6, className }: PageDotsProps) {
  if (count < 2) return null;
  const shown = Math.min(count, max);
  // With more cards than dashes, the last dash stands for «the rest».
  const current = Math.min(index, shown - 1);
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${itemLabel} ${index + 1} de ${count}`}
      className={cn('flex-row gap-1', className)}
    >
      {Array.from({ length: shown }, (_, dash) => (
        <View key={dash} className={cn('h-[3px] w-5 rounded-chip', dash === current ? 'bg-fg' : 'bg-fg/20')} />
      ))}
    </View>
  );
}

import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

export interface Stat {
  value: string;
  label: string;
  /** Wider column for a word instead of a number («Colombiana»). */
  wide?: boolean;
}

/**
 * Mobile v3: the facts that decide whether the diner goes (50 m · 10 p. m. · Colombiana), in one matte piece with thin
 * dividers. Figure 22/800 tabular + label 13/600.
 */
export function StatGroup({ stats, className }: { stats: Stat[]; className?: string }) {
  const { colors } = useTheme();
  if (stats.length === 0) return null;
  return (
    <View className={cn('flex-row rounded-piece bg-surface px-1.5 py-4', className)} style={{ boxShadow: colors.shadowStats }}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          accessible
          accessibilityLabel={`${stat.label}: ${stat.value}`}
          className="min-w-0 flex-row items-center"
          style={{ flex: stat.wide ? 1.4 : 1 }}
        >
          {index > 0 ? <View className="h-9 w-px bg-line" /> : null}
          <View className="min-w-0 flex-1 items-center gap-0.5 px-1">
            <Text variant="stat" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {stat.value}
            </Text>
            <Text variant="small" tone="secondary" numberOfLines={1}>
              {stat.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

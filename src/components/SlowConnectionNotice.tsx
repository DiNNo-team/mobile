import { useIsFetching } from '@tanstack/react-query';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingSurface, Spinner, Text, useDelayedLoading } from '@/components/ui';

/** Reparto 9 (PBI 6.1): Render's free plan can take ~50 s to wake up; after 5 s the app says it is working on it. */
export const SLOW_CONNECTION_MS = 5_000;

/** Pill on top of the screen while any request takes longer than 5 s. Does not block the screen. */
export function SlowConnectionNotice() {
  const insets = useSafeAreaInsets();
  const slow = useDelayedLoading(useIsFetching() > 0, SLOW_CONNECTION_MS);
  if (!slow) return null;
  return (
    <View pointerEvents="none" className="absolute left-0 right-0 items-center" style={{ top: insets.top + 8 }}>
      <FloatingSurface shape="chip" className="self-center">
        <View accessibilityLiveRegion="polite" accessibilityRole="progressbar" className="h-9 flex-row items-center gap-2">
          <Spinner size={16} />
          <Text variant="chip">Conectando con DiNNo…</Text>
        </View>
      </FloatingSurface>
    </View>
  );
}

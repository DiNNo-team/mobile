import { View } from 'react-native';

import { BrandSymbol, Text } from '@/components/ui';
import { AuthScreen } from '@/features/session/components/AuthScreen';

/** A restored session checks its profile with the backend; Render can take a while to wake up (manual 11.5). */
export default function ConnectingScreen() {
  return (
    <AuthScreen align="center" showLogo={false}>
      <View accessibilityLiveRegion="polite" className="items-center gap-4">
        <BrandSymbol height={56} />
        <Text variant="h3">Conectando con DiNNo…</Text>
        <Text variant="sec" tone="secondary" className="text-center">
          Esto puede tardar unos segundos.
        </Text>
      </View>
    </AuthScreen>
  );
}

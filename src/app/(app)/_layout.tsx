import { Stack } from 'expo-router';
import { View } from 'react-native';

import { SlowConnectionNotice } from '@/components/SlowConnectionNotice';
import { env } from '@/config/env';
import { useAvailabilityRealtime } from '@/features/realtime/use-availability-realtime';

/**
 * Screens of a diner with a session: the tabs and the restaurant detail on top of them. Live availability runs
 * while this group is mounted (only with a diner session; signing out unmounts it and closes the socket).
 * With the example data there is no backend, so there is no socket.
 */
export default function AppLayout() {
  useAvailabilityRealtime(!env.useMocks);
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />
      <SlowConnectionNotice />
    </View>
  );
}

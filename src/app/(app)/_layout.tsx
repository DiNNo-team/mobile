import { Stack } from 'expo-router';
import { View } from 'react-native';

import { SlowConnectionNotice } from '@/components/SlowConnectionNotice';
import { env } from '@/config/env';
import { useDinerSocketConnection } from '@/features/realtime/socket';
import { useAvailabilityRealtime } from '@/features/realtime/use-availability-realtime';

/**
 * Screens of a diner with a session: the tabs, the restaurant detail and the reservation on top of them. The live socket runs
 * while this group is mounted (only with a diner session; signing out unmounts it and closes the socket).
 * With the example data there is no backend, so there is no socket.
 */
export default function AppLayout() {
  // One socket for the whole session (shared by availability and, from Sprint 3, the diner's reservations).
  useDinerSocketConnection(!env.useMocks);
  useAvailabilityRealtime();
  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />
      <SlowConnectionNotice />
    </View>
  );
}

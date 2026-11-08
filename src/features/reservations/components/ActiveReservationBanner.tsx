import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Card, Icon, StatusShape, Text } from '@/components/ui';

import { bannerText } from '../messages';
import { reservationKeys, useActiveReservation, useMonotonicNow } from '../queries';
import { formatCountdown, remainingMs, spokenCountdown } from '../timer';

/**
 * Fixed banner of Explorar (reparto 9.2): «Tienes una mesa reservada · 12:34», with the time running from the server
 * clock. Tapping it opens the reservation. It disappears when the reservation stops being active: at 00:00 the app asks
 * the backend, which confirms the expiry. On the map it floats under the header (`elevation="floating"`).
 */
export function ActiveReservationBanner({ floating = false, className }: { floating?: boolean; className?: string }) {
  const queryClient = useQueryClient();
  const active = useActiveReservation();
  const reservation = active.data;
  const now = useMonotonicNow(!!reservation);
  const left = reservation ? remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, now) : 0;
  const atZero = !!reservation && left === 0;

  // At 00:00 the backend has the last word: ask again (it expires a due reservation when reading it).
  useEffect(() => {
    if (!atZero) return;
    void queryClient.invalidateQueries({ queryKey: reservationKeys.active() });
    const timer = setInterval(() => void queryClient.invalidateQueries({ queryKey: reservationKeys.active() }), 5_000);
    return () => clearInterval(timer);
  }, [atZero, queryClient]);

  if (!reservation || reservation.status !== 'active') return null;
  const countdown = formatCountdown(left);

  return (
    <Card
      shape="tile"
      elevation={floating ? 'floating' : 'resting'}
      onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: reservation.id } })}
      accessibilityLabel={`Tienes una mesa reservada en ${reservation.restaurant.name}. Quedan ${spokenCountdown(left)}.`}
      accessibilityHint="Abre tu reserva"
      className={className}
    >
      <View className="flex-row items-center gap-3">
        <StatusShape shape="dot" color="ok" size={10} />
        <View className="min-w-0 flex-1">
          <Text variant="body" className="font-bold" tabular numberOfLines={1}>
            {bannerText(countdown)}
          </Text>
          <Text variant="sec" tone="secondary" numberOfLines={1}>
            {reservation.restaurant.name}
          </Text>
        </View>
        <Icon icon={ChevronRight} size={20} />
      </View>
    </Card>
  );
}

import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { searchKeys } from '@/features/search/queries';
import { useSearchStore } from '@/features/search/store';
import type { RestaurantDetail } from '@/features/search/types';

import { activeElsewhereText, RESERVATION_TEXT, reserveBlockedReason } from '../messages';
import { useActiveReservation } from '../queries';
import { ReserveSheet } from './ReserveSheet';

/**
 * The detail's main action (Task 1.1.5): «Reservar mesa» opens the reserve sheet. With a reservation already in course
 * (one per diner, §12.1) it becomes «Ver mi reserva», so the diner never runs into the 409 (decision H8).
 */
export function ReserveAction({ restaurant }: { restaurant: RestaurantDetail }) {
  const queryClient = useQueryClient();
  const active = useActiveReservation();
  const partySize = useSearchStore((state) => state.filters.partySize);
  const [open, setOpen] = useState(false);

  if (active.data) {
    const reservation = active.data;
    const here = reservation.restaurant.id === restaurant.id;
    return (
      <View className="gap-2">
        <Text variant="sec">{here ? RESERVATION_TEXT.activeElsewhere : activeElsewhereText(reservation.restaurant.name)}</Text>
        <Button
          label={RESERVATION_TEXT.viewMine}
          fullWidth
          onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: reservation.id } })}
        />
      </View>
    );
  }

  const reason = reserveBlockedReason(restaurant);
  return (
    <View className="gap-2">
      <Button
        label={RESERVATION_TEXT.reserve}
        fullWidth
        disabled={reason !== null}
        accessibilityHint={reason ?? undefined}
        onPress={() => setOpen(true)}
      />
      {reason ? (
        <Text variant="sec" className="text-center">
          {reason}
        </Text>
      ) : null}
      {open ? (
        <ReserveSheet
          visible={open}
          onClose={() => setOpen(false)}
          restaurant={restaurant}
          initialPartySize={partySize}
          onUnavailable={() => void queryClient.invalidateQueries({ queryKey: searchKeys.restaurant(restaurant.id) })}
        />
      ) : null}
    </View>
  );
}

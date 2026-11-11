import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { searchKeys } from '@/features/search/queries';
import { useSearchStore } from '@/features/search/store';
import type { RestaurantDetail } from '@/features/search/types';

import { activeElsewhereText, RESERVATION_TEXT, reserveBlockedReason } from '../messages';
import { useActiveReservation } from '../queries';
import { ReserveSheet } from './ReserveSheet';

/**
 * What the detail says about reserving, as a line above its action bar: «Ya tienes una mesa reservada…» with a
 * reservation in course, or why it cannot reserve (Cerrado, Sin mesas). `null` when «Reservar mesa» just works.
 */
export function useReserveNote(restaurant: RestaurantDetail): string | null {
  const active = useActiveReservation();
  if (active.data) {
    return active.data.restaurant.id === restaurant.id ? RESERVATION_TEXT.activeElsewhere : activeElsewhereText(active.data.restaurant.name);
  }
  return reserveBlockedReason(restaurant);
}

/**
 * The detail's main action (Task 1.1.5), the orange pill of the action bar (mobile v3): «Reservar mesa» opens the
 * reserve sheet. With a reservation already in course (one per diner, §12.1) it becomes «Ver mi reserva», so the diner
 * never runs into the 409 (decision H8). Disabled, with the reason as its hint, when it is Cerrado or Sin mesas.
 */
export function ReserveAction({ restaurant, className }: { restaurant: RestaurantDetail; className?: string }) {
  const queryClient = useQueryClient();
  const active = useActiveReservation();
  const partySize = useSearchStore((state) => state.filters.partySize);
  const [open, setOpen] = useState(false);

  if (active.data) {
    const reservation = active.data;
    return (
      <Button
        shape="pill"
        size="xl"
        label={RESERVATION_TEXT.viewMine}
        fullWidth
        className={className}
        onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: reservation.id } })}
      />
    );
  }

  const reason = reserveBlockedReason(restaurant);
  return (
    <>
      <Button
        shape="pill"
        size="xl"
        label={RESERVATION_TEXT.reserve}
        fullWidth
        disabled={reason !== null}
        accessibilityHint={reason ?? undefined}
        className={className}
        onPress={() => setOpen(true)}
      />
      {open ? (
        <ReserveSheet
          visible={open}
          onClose={() => setOpen(false)}
          restaurant={restaurant}
          initialPartySize={partySize}
          onUnavailable={() => void queryClient.invalidateQueries({ queryKey: searchKeys.restaurant(restaurant.id) })}
        />
      ) : null}
    </>
  );
}

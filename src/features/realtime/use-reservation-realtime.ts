import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useToast } from '@/components/ui';
import { completedText, RESERVATION_TEXT } from '@/features/reservations/messages';
import { reservationKeys, type TimedReservation } from '@/features/reservations/queries';

import { applyClosedEvent, isReservationClosedEvent, RESERVATION_CLOSED_EVENTS } from './reservation-events';
import { onReconnect, useDinerSocket } from './socket';

/**
 * The diner's reservation live (Tasks 5.1.5, 3.2.4 and 4.2.4, CLAUDE.md §12.7) on the session's shared socket:
 * `reservation.cancelled`, `.expired` and `.checked_in` of the room `diner:{userId}`. Each event changes the cache at
 * once (the screen, the detail button and the Explorar banner flip together, and the code disappears), and then
 * GET /reservations/:id and /active are asked again for the full data. A check-in made at the restaurant shows
 * «¡Listo!…» without reloading; an expiry is noticed too. Back after a cut or from the background, the active
 * reservation is asked again (no stale data), and the 30 s refresh of the reservation screen stays as backup.
 */
export function useReservationRealtime() {
  const queryClient = useQueryClient();
  const socket = useDinerSocket();
  const { showToast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const onClosed = (payload: unknown) => {
      if (!isReservationClosedEvent(payload)) return;
      const detailKey = reservationKeys.detail(payload.reservationId);
      const before =
        queryClient.getQueryData<TimedReservation>(detailKey) ??
        queryClient.getQueryData<TimedReservation | null>(reservationKeys.active()) ??
        undefined;
      const wasActive = before?.id === payload.reservationId && before.status === 'active';

      queryClient.setQueryData<TimedReservation>(detailKey, (current) => applyClosedEvent(current, payload) ?? undefined);
      queryClient.setQueryData<TimedReservation | null>(reservationKeys.active(), (current) =>
        current?.id === payload.reservationId ? null : current,
      );
      void queryClient.invalidateQueries({ queryKey: detailKey });
      void queryClient.invalidateQueries({ queryKey: reservationKeys.active() });

      // The diner cancels from this phone: its own screen already says so. The other two come from outside.
      if (!wasActive || !before) return;
      if (payload.status === 'completed') showToast({ type: 'success', message: completedText(before.restaurant.name) });
      if (payload.status === 'expired') showToast({ type: 'info', message: RESERVATION_TEXT.expired });
    };

    for (const event of RESERVATION_CLOSED_EVENTS) socket.on(event, onClosed);
    const offReconnect = onReconnect(socket, () => {
      void queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    });

    return () => {
      for (const event of RESERVATION_CLOSED_EVENTS) socket.off(event, onClosed);
      offReconnect();
    };
  }, [socket, queryClient, showToast]);
}

import type { TimedReservation } from '@/features/reservations/queries';
import type { ReservationClosedEvent } from '@/features/reservations/types';

// Events of the diner's own room `diner:{userId}` (CLAUDE.md §12.7 and §12.8): the server assigns the room on connect,
// so the app only receives what happens to its own reservations. Payloads are checked before use.

export const RESERVATION_CANCELLED = 'reservation.cancelled';
export const RESERVATION_EXPIRED = 'reservation.expired';
export const RESERVATION_CHECKED_IN = 'reservation.checked_in';
export const RESERVATION_CLOSED_EVENTS = [RESERVATION_CANCELLED, RESERVATION_EXPIRED, RESERVATION_CHECKED_IN] as const;

const FINAL_STATUSES = ['cancelled', 'expired', 'completed'] as const;

export function isReservationClosedEvent(value: unknown): value is ReservationClosedEvent {
  if (typeof value !== 'object' || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.reservationId === 'string' &&
    event.reservationId.length > 0 &&
    FINAL_STATUSES.includes(event.status as (typeof FINAL_STATUSES)[number]) &&
    typeof event.tableId === 'string'
  );
}

/**
 * The reservation as the event leaves it, before the backend is asked again: the final status, the code gone (it only
 * exists while active) and the matching date. An event about another reservation, or one already final, changes nothing
 * (a state never goes back: §12.1).
 */
export function applyClosedEvent(reservation: TimedReservation | null | undefined, event: ReservationClosedEvent) {
  if (!reservation || reservation.id !== event.reservationId || reservation.status !== 'active') return reservation;
  return {
    ...reservation,
    status: event.status,
    code: null,
    cancelledAt: event.status === 'cancelled' ? event.at : reservation.cancelledAt,
    expiredAt: event.status === 'expired' ? event.at : reservation.expiredAt,
    checkedInAt: event.status === 'completed' ? event.at : reservation.checkedInAt,
  };
}

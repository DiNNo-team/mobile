import type { TimedReservation } from '@/features/reservations/queries';

import { applyClosedEvent, isReservationClosedEvent } from './reservation-events';

const active: TimedReservation = {
  id: 'r1',
  code: 'K7M4QX',
  status: 'active',
  partySize: 2,
  createdAt: '2026-11-08T17:00:00Z',
  expiresAt: '2026-11-08T17:15:00Z',
  serverTime: '2026-11-08T17:00:00Z',
  cancelledAt: null,
  expiredAt: null,
  checkedInAt: null,
  restaurant: { id: 'casa72', name: 'Casa 72', address: 'Calle 72', latitude: 4.65, longitude: -74.05 },
  table: { identifier: '04', capacity: 4 },
  receivedAt: 0,
};

const event = (status: 'cancelled' | 'expired' | 'completed', reservationId = 'r1') => ({
  reservationId,
  status,
  tableId: 't4',
  at: '2026-11-08T17:08:00Z',
});

describe('isReservationClosedEvent (§12.8)', () => {
  it('accepts the three closing events and rejects anything else', () => {
    expect(isReservationClosedEvent(event('completed'))).toBe(true);
    expect(isReservationClosedEvent({ ...event('completed'), status: 'active' })).toBe(false);
    expect(isReservationClosedEvent({ status: 'expired' })).toBe(false);
    expect(isReservationClosedEvent(null)).toBe(false);
  });
});

describe('applyClosedEvent', () => {
  it('a check-in at the restaurant: Cumplida, no code, with its time', () => {
    expect(applyClosedEvent(active, event('completed'))).toMatchObject({
      status: 'completed',
      code: null,
      checkedInAt: '2026-11-08T17:08:00Z',
    });
  });

  it('an expiry or a cancellation clears the code and keeps the other dates', () => {
    expect(applyClosedEvent(active, event('expired'))).toMatchObject({ status: 'expired', code: null, expiredAt: '2026-11-08T17:08:00Z', checkedInAt: null });
    expect(applyClosedEvent(active, event('cancelled'))).toMatchObject({ status: 'cancelled', code: null, cancelledAt: '2026-11-08T17:08:00Z' });
  });

  it('never touches another reservation nor goes back from a final state', () => {
    expect(applyClosedEvent(active, event('completed', 'other'))).toBe(active);
    const cancelled = { ...active, status: 'cancelled' as const, code: null };
    expect(applyClosedEvent(cancelled, event('completed'))).toBe(cancelled);
    expect(applyClosedEvent(null, event('completed'))).toBeNull();
  });
});

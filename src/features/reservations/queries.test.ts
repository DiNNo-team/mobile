import { QueryClient } from '@tanstack/react-query';

import { reservationKeys, storeReservation, type TimedReservation } from './queries';

/** Without the cache's garbage-collection timer, so Jest exits at once. */
const newClient = () => new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
import type { Reservation } from './types';

const base: Reservation = {
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
};

describe('storeReservation (one source for the screen, the detail button and the Explorar banner)', () => {
  it('an active reservation becomes the active one and its detail', () => {
    const client = newClient();
    storeReservation(client, base);
    expect(client.getQueryData<TimedReservation>(reservationKeys.active())?.id).toBe('r1');
    expect(client.getQueryData<TimedReservation>(reservationKeys.detail('r1'))?.code).toBe('K7M4QX');
  });

  it('when it stops being active (cancelled, expired, completed) the active slot empties: the banner goes away', () => {
    const client = newClient();
    storeReservation(client, base);
    storeReservation(client, { ...base, status: 'cancelled', code: null, cancelledAt: '2026-11-08T17:05:00Z' });
    expect(client.getQueryData(reservationKeys.active())).toBeNull();
    expect(client.getQueryData<TimedReservation>(reservationKeys.detail('r1'))).toMatchObject({ status: 'cancelled', code: null });
  });

  it('a finished old reservation never clears another active one', () => {
    const client = newClient();
    storeReservation(client, base);
    storeReservation(client, { ...base, id: 'old', status: 'expired', code: null });
    expect(client.getQueryData<TimedReservation>(reservationKeys.active())?.id).toBe('r1');
  });
});

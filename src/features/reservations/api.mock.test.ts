import { MOCK_RESTAURANTS } from '@/features/search/mock-data';
import { ApiError } from '@/lib/api/errors';

import { mockReservationsApi, mockReservationsControl } from './api.mock';

const open = MOCK_RESTAURANTS.find((restaurant) => restaurant.isOpenNow && restaurant.maxFreeCapacity >= 2)!;
const closed = MOCK_RESTAURANTS.find((restaurant) => !restaurant.isOpenNow);

async function errorCodeOf(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
  } catch (error) {
    return error instanceof ApiError ? error.errorCode : 'not-an-api-error';
  }
  return undefined;
}

beforeEach(() => {
  mockReservationsControl.reset();
  mockReservationsControl.setLatency(0);
});

describe('mock reservations (same rules as CLAUDE.md §12)', () => {
  it('creates an active reservation with a 6-character code and the server time', async () => {
    const reservation = await mockReservationsApi.create({ restaurantId: open.id, partySize: 2 });
    expect(reservation.status).toBe('active');
    expect(reservation.code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    expect(Date.parse(reservation.expiresAt)).toBeGreaterThan(Date.parse(reservation.serverTime));
    expect((await mockReservationsApi.getActive()).reservation?.id).toBe(reservation.id);
  });

  it('a second one → ACTIVE_RESERVATION_EXISTS; more people than its tables → NO_TABLE_AVAILABLE', async () => {
    await mockReservationsApi.create({ restaurantId: open.id, partySize: 2 });
    expect(await errorCodeOf(mockReservationsApi.create({ restaurantId: open.id, partySize: 2 }))).toBe('ACTIVE_RESERVATION_EXISTS');
    mockReservationsControl.reset();
    mockReservationsControl.setLatency(0);
    expect(await errorCodeOf(mockReservationsApi.create({ restaurantId: open.id, partySize: 20 }))).toBe('NO_TABLE_AVAILABLE');
  });

  it('a closed restaurant → RESTAURANT_CLOSED; an unknown one → RESTAURANT_NOT_FOUND', async () => {
    if (closed) expect(await errorCodeOf(mockReservationsApi.create({ restaurantId: closed.id, partySize: 2 }))).toBe('RESTAURANT_CLOSED');
    expect(await errorCodeOf(mockReservationsApi.create({ restaurantId: 'nope', partySize: 2 }))).toBe('RESTAURANT_NOT_FOUND');
  });

  it('cancelling clears the code; twice → RESERVATION_NOT_ACTIVE; unknown → RESERVATION_NOT_FOUND', async () => {
    const reservation = await mockReservationsApi.create({ restaurantId: open.id, partySize: 2 });
    const cancelled = await mockReservationsApi.cancel(reservation.id);
    expect(cancelled).toMatchObject({ status: 'cancelled', code: null });
    expect(cancelled.cancelledAt).not.toBeNull();
    expect((await mockReservationsApi.getActive()).reservation).toBeNull();
    expect(await errorCodeOf(mockReservationsApi.cancel(reservation.id))).toBe('RESERVATION_NOT_ACTIVE');
    expect(await errorCodeOf(mockReservationsApi.cancel('nope'))).toBe('RESERVATION_NOT_FOUND');
  });

  it('an expired one is read as expired, without code', async () => {
    jest.useFakeTimers({ now: Date.parse('2026-11-08T17:00:00Z') });
    try {
      const reservation = await mockReservationsApi.create({ restaurantId: open.id, partySize: 2 });
      jest.setSystemTime(Date.parse('2026-11-08T17:04:00Z'));
      expect((await mockReservationsApi.getActive()).reservation).toBeNull();
      expect(await mockReservationsApi.getById(reservation.id)).toMatchObject({ status: 'expired', code: null });
    } finally {
      jest.useRealTimers();
    }
  });
});

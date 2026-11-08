import { MOCK_RESTAURANTS } from '@/features/search/mock-data';
import { ApiError, ErrorCode } from '@/lib/api/errors';

import type { Reservation, ReservationsApi } from './types';

// In-memory stand-in for the reservations of CLAUDE.md §12.8, with the same rules as the backend on the example
// restaurants of the search mock. Every errorCode comes out naturally:
// - a closed restaurant → RESTAURANT_CLOSED; more people than its biggest free table → NO_TABLE_AVAILABLE;
// - a second reservation → ACTIVE_RESERVATION_EXISTS; an unknown restaurant → RESTAURANT_NOT_FOUND;
// - cancelling twice → RESERVATION_NOT_ACTIVE; an unknown id → RESERVATION_NOT_FOUND.
// It lasts 3 minutes (like the expiry demo), so «Vencida» can be seen without waiting 15.

const MOCK_LATENCY_MS = 400;
export const MOCK_TTL_MS = 3 * 60_000;
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

let reservations: Reservation[] = [];
let latencyMs = MOCK_LATENCY_MS;
let nextId = 1;

const wait = () => (latencyMs > 0 ? new Promise((resolve) => setTimeout(resolve, latencyMs)) : Promise.resolve());
const now = () => new Date().toISOString();

function fail(status: number, errorCode: string, message: string): never {
  throw new ApiError({ status, kind: 'http', errorCode, message });
}

function randomCode(): string {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
}

/** Like the backend: an active reservation past its expiry is expired on read (without code). */
function expireDue() {
  const at = Date.now();
  reservations = reservations.map((reservation) =>
    reservation.status === 'active' && Date.parse(reservation.expiresAt) <= at
      ? { ...reservation, status: 'expired', code: null, expiredAt: now() }
      : reservation,
  );
}

const fresh = (reservation: Reservation): Reservation => ({ ...reservation, serverTime: now() });

/** Test and dev controls. */
export const mockReservationsControl = {
  reset() {
    reservations = [];
    nextId = 1;
    latencyMs = MOCK_LATENCY_MS;
  },
  setLatency(ms: number) {
    latencyMs = ms;
  },
  /** The restaurant validated the code (only the web does it): the reservation becomes Cumplida. */
  checkInActive() {
    reservations = reservations.map((reservation) =>
      reservation.status === 'active' ? { ...reservation, status: 'completed', code: null, checkedInAt: now() } : reservation,
    );
  },
  snapshot(): Reservation[] {
    return reservations.map((reservation) => ({ ...reservation }));
  },
};

export const mockReservationsApi: ReservationsApi = {
  async create({ restaurantId, partySize }) {
    await wait();
    expireDue();
    const restaurant = MOCK_RESTAURANTS.find((item) => item.id === restaurantId);
    if (!restaurant) fail(404, ErrorCode.RestaurantNotFound, 'No encontramos este restaurante.');
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
      throw new ApiError({ status: 400, kind: 'http', message: 'Las personas van de 1 a 20.' });
    }
    if (!restaurant.isOpenNow) fail(409, ErrorCode.RestaurantClosed, 'Este restaurante está cerrado.');
    if (reservations.some((reservation) => reservation.status === 'active')) {
      fail(409, ErrorCode.ActiveReservationExists, 'Ya tienes una reserva activa.');
    }
    if (restaurant.maxFreeCapacity < partySize) fail(409, ErrorCode.NoTableAvailable, 'No hay una mesa disponible para ese grupo.');
    const createdAt = Date.now();
    const reservation: Reservation = {
      id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`,
      code: randomCode(),
      status: 'active',
      partySize,
      createdAt: new Date(createdAt).toISOString(),
      expiresAt: new Date(createdAt + MOCK_TTL_MS).toISOString(),
      serverTime: new Date(createdAt).toISOString(),
      cancelledAt: null,
      expiredAt: null,
      checkedInAt: null,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      },
      table: { identifier: String(Math.max(partySize, 2)).padStart(2, '0'), capacity: Math.max(partySize, 2) },
    };
    reservations = [...reservations, reservation];
    return fresh(reservation);
  },
  async getActive() {
    await wait();
    expireDue();
    const active = reservations.find((reservation) => reservation.status === 'active');
    return { reservation: active ? fresh(active) : null, serverTime: now() };
  },
  async getById(id) {
    await wait();
    expireDue();
    const reservation = reservations.find((item) => item.id === id);
    if (!reservation) fail(404, ErrorCode.ReservationNotFound, 'No encontramos esa reserva.');
    return fresh(reservation);
  },
  async cancel(id) {
    await wait();
    expireDue();
    const reservation = reservations.find((item) => item.id === id);
    if (!reservation) fail(404, ErrorCode.ReservationNotFound, 'No encontramos esa reserva.');
    if (reservation.status !== 'active') fail(409, ErrorCode.ReservationNotActive, 'Esta reserva ya no está activa.');
    const cancelled: Reservation = { ...reservation, status: 'cancelled', code: null, cancelledAt: now() };
    reservations = reservations.map((item) => (item.id === id ? cancelled : item));
    return fresh(cancelled);
  },
};

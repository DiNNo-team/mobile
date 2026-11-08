// Sprint 3 contract with the backend (Elizabeth): CLAUDE.md §12.8, the same in the three repos. A contract change
// touches only this file and the api.* files.

/** `active` → `cancelled` | `expired` | `completed`, never back (§12.1). */
export type ReservationStatus = 'active' | 'cancelled' | 'expired' | 'completed';

/** The diner's reservation (POST /reservations, GET /reservations/active and /:id, POST /:id/cancel). */
export interface Reservation {
  id: string;
  /** 6 characters; only while `status === 'active'`, `null` in every other state. Never shown outside `active`. */
  code: string | null;
  status: ReservationStatus;
  /** 1–20 people. */
  partySize: number;
  /** ISO 8601 UTC. */
  createdAt: string;
  expiresAt: string;
  /** Server clock when it answered: the countdown is `expiresAt − serverTime`, never the phone clock alone. */
  serverTime: string;
  cancelledAt: string | null;
  expiredAt: string | null;
  checkedInAt: string | null;
  restaurant: { id: string; name: string; address: string | null; latitude: number; longitude: number };
  /** `identifier` as typed by the restaurant ("04", "Mesa 4"): show it with `formatTableName`. */
  table: { identifier: string; capacity: number };
}

/** 200 of GET /reservations/active: `reservation: null` when there is none (never 404). */
export interface ActiveReservationResponse {
  reservation: Reservation | null;
  serverTime: string;
}

/** `reservation.cancelled` · `reservation.expired` · `reservation.checked_in` (room `diner:{userId}`). */
export interface ReservationClosedEvent {
  reservationId: string;
  status: Exclude<ReservationStatus, 'active'>;
  tableId: string;
  /** ISO 8601 UTC. */
  at: string;
}

export interface CreateReservationInput {
  restaurantId: string;
  /** 1–20. */
  partySize: number;
}

export interface ReservationsApi {
  create: (input: CreateReservationInput) => Promise<Reservation>;
  getActive: () => Promise<ActiveReservationResponse>;
  getById: (id: string) => Promise<Reservation>;
  cancel: (id: string) => Promise<Reservation>;
}

export const PARTY_SIZE_LIMITS = { min: 1, max: 20 } as const;

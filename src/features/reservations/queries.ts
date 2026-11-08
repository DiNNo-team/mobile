import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { reservationsApi } from './api';
import { monotonicNow } from './timer';
import type { CreateReservationInput, Reservation } from './types';

/** Backup of the socket on the active reservation screen (CLAUDE.md §12.7): every 30 s. */
export const RESERVATION_REFRESH_MS = 30_000;

/** A reservation plus the monotonic instant it arrived, to count down without the phone's clock. */
export interface TimedReservation extends Reservation {
  receivedAt: number;
}

/** Personal data: SessionProvider clears the whole query cache on sign-out, these keys included. */
export const reservationKeys = {
  all: ['reservations'] as const,
  /** The diner's active reservation, or null: the global "mi reserva activa" of the app. */
  active: () => [...reservationKeys.all, 'active'] as const,
  detail: (id: string) => [...reservationKeys.all, 'detail', id] as const,
};

const timed = (reservation: Reservation): TimedReservation => ({ ...reservation, receivedAt: monotonicNow() });

/** Writes a fresh reservation everywhere it is shown: its detail, and the active slot (it is active, or it left). */
export function storeReservation(queryClient: QueryClient, reservation: Reservation) {
  const value = timed(reservation);
  queryClient.setQueryData(reservationKeys.detail(reservation.id), value);
  queryClient.setQueryData<TimedReservation | null>(reservationKeys.active(), (current) => {
    if (reservation.status === 'active') return value;
    return current?.id === reservation.id ? null : current;
  });
}

/**
 * GET /reservations/active: the diner's reservation in course, or null. Read when the app opens and after signing in,
 * and again on returning to the foreground (query lifecycle). `poll` adds the 30 s backup of the reservation screen.
 */
export function useActiveReservation({ poll = false, enabled = true }: { poll?: boolean; enabled?: boolean } = {}) {
  return useQuery({
    queryKey: reservationKeys.active(),
    queryFn: async (): Promise<TimedReservation | null> => {
      const { reservation } = await reservationsApi.getActive();
      return reservation ? timed(reservation) : null;
    },
    refetchInterval: poll ? RESERVATION_REFRESH_MS : false,
    staleTime: 0,
    enabled,
  });
}

/** GET /reservations/:id in any state (the final screens), every 30 s while it is active. */
export function useReservation(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: async () => {
      const reservation = await reservationsApi.getById(id);
      storeReservation(queryClient, reservation);
      return timed(reservation);
    },
    refetchInterval: (query) => (query.state.data?.status === 'active' ? RESERVATION_REFRESH_MS : false),
    staleTime: 0,
  });
}

/** POST /reservations; the 201 is stored as the active reservation. */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReservationInput) => reservationsApi.create(input),
    onSuccess: (reservation) => storeReservation(queryClient, reservation),
  });
}

/** POST /reservations/:id/cancel; the answer (cancelled, no code) replaces it everywhere. */
export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: (reservation) => storeReservation(queryClient, reservation),
  });
}

/** Monotonic "now" that ticks every second while `active`, for the countdowns. */
export function useMonotonicNow(active: boolean): number {
  const [now, setNow] = useState(monotonicNow);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(monotonicNow()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

import { apiRequest } from '@/lib/api/client';

import type { ActiveReservationResponse, Reservation, ReservationsApi } from './types';

export const httpReservationsApi: ReservationsApi = {
  create: (input) => apiRequest<Reservation>('/reservations', { method: 'POST', body: input }),
  getActive: () => apiRequest<ActiveReservationResponse>('/reservations/active'),
  getById: (id) => apiRequest<Reservation>(`/reservations/${encodeURIComponent(id)}`),
  cancel: (id) => apiRequest<Reservation>(`/reservations/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
};

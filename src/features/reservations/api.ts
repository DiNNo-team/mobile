import { env } from '@/config/env';

import { httpReservationsApi } from './api.http';
import { mockReservationsApi } from './api.mock';
import type { ReservationsApi } from './types';

/** Screens use this one: the backend, or the in-memory examples with EXPO_PUBLIC_USE_MOCKS=true. */
export const reservationsApi: ReservationsApi = env.useMocks ? mockReservationsApi : httpReservationsApi;

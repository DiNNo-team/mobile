import { env } from '@/config/env';
import { apiRequest } from '@/lib/api/client';

import type { AccountApi, Me } from './types';

const httpAccountApi: AccountApi = {
  getMe: () => apiRequest<Me>('/me'),
  createDinerProfile: (input) => apiRequest<Me>('/diners/me', { method: 'POST', body: input }),
};

const MOCK_DINER: Me = {
  id: '9b7e4c22-0000-4f00-8a00-00000000d1e7',
  email: 'comensal@dinno.test',
  displayName: 'Comensal de prueba',
  role: 'diner',
  restaurantId: null,
};

const mockAccountApi: AccountApi = {
  getMe: async () => MOCK_DINER,
  createDinerProfile: async (input) => ({ ...MOCK_DINER, displayName: input.displayName ?? MOCK_DINER.displayName }),
};

export const accountApi: AccountApi = env.useMocks ? mockAccountApi : httpAccountApi;

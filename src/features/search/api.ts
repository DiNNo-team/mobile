import { env } from '@/config/env';

import { httpSearchApi } from './api.http';
import { mockSearchApi } from './api.mock';
import type { SearchApi } from './types';

/** Screens use this one: the backend, or the in-memory examples with EXPO_PUBLIC_USE_MOCKS=true. */
export const searchApi: SearchApi = env.useMocks ? mockSearchApi : httpSearchApi;

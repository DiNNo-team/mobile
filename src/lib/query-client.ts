import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api/errors';

const MAX_RETRIES = 2;

/** 4xx answers will not change by retrying; network errors, timeouts and 5xx get two more tries. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.kind === 'http' && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 30_000 },
    mutations: { retry: false },
  },
});

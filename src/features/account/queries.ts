import { useQuery } from '@tanstack/react-query';

import { accountApi } from './api';

export const accountKeys = {
  me: ['me'] as const,
};

/**
 * GET /me for the Profile tab: fresh name and email each time the data is stale, with its own loading and error.
 * A 401 ends the session through the provider's API error listener; signing out clears this query with the cache.
 */
export function useMeQuery() {
  return useQuery({ queryKey: accountKeys.me, queryFn: () => accountApi.getMe() });
}

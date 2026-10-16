import { skipToken, useQuery } from '@tanstack/react-query';

import { searchApi } from './api';
import type { SearchFilters, SearchOrigin, Zone } from './types';

/** The zones are a closed list (CLAUDE.md §10): read them once per session. */
const ZONES_STALE_MS = 60 * 60 * 1000;

export const searchKeys = {
  all: ['search'] as const,
  zones: () => [...searchKeys.all, 'zones'] as const,
  restaurants: (origin: SearchOrigin | null, filters: SearchFilters) => [...searchKeys.all, 'restaurants', origin, filters] as const,
};

/** GET /search/zones. */
export function useZones() {
  return useQuery({ queryKey: searchKeys.zones(), queryFn: () => searchApi.getZones(), staleTime: ZONES_STALE_MS });
}

/** GET /search/restaurants for the chosen origin and filters; waits until there is an origin. */
export function useRestaurantSearch(origin: SearchOrigin | null, filters: SearchFilters) {
  return useQuery({
    queryKey: searchKeys.restaurants(origin, filters),
    queryFn: origin ? () => searchApi.searchRestaurants(origin, filters) : skipToken,
  });
}

/** Name of a zone for the screen; the id while the list loads. */
export function getZoneName(zones: Zone[] | undefined, zoneId: string): string {
  return zones?.find((zone) => zone.id === zoneId)?.name ?? zoneId;
}

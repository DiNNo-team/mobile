import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';

import { searchApi } from './api';
import type { Coordinates, SearchFilters, SearchOrigin, Zone } from './types';

/** The zones are a closed list (CLAUDE.md §10): read them once per session. */
const ZONES_STALE_MS = 60 * 60 * 1000;

export const searchKeys = {
  all: ['search'] as const,
  zones: () => [...searchKeys.all, 'zones'] as const,
  restaurants: (origin: SearchOrigin | null, filters: SearchFilters) => [...searchKeys.all, 'restaurants', origin, filters] as const,
  /** Every detail query of a restaurant starts with this key (the socket of phase 6 updates them by prefix). */
  restaurant: (id: string) => ['restaurant', id] as const,
};

/** GET /search/zones. */
export function useZones() {
  return useQuery({ queryKey: searchKeys.zones(), queryFn: () => searchApi.getZones(), staleTime: ZONES_STALE_MS });
}

/**
 * GET /search/restaurants for the chosen origin and filters; waits until there is an origin. While a new
 * search runs, the previous results stay on screen (`isPlaceholderData`), so the map is not rebuilt.
 */
export function useRestaurantSearch(origin: SearchOrigin | null, filters: SearchFilters) {
  return useQuery({
    queryKey: searchKeys.restaurants(origin, filters),
    queryFn: origin ? () => searchApi.searchRestaurants(origin, filters) : skipToken,
    placeholderData: keepPreviousData,
  });
}

/** GET /restaurants/:id/public; `from` adds `distanceKm` (only with the phone's position). */
export function useRestaurantDetail(id: string, from: Coordinates | undefined) {
  return useQuery({
    queryKey: [...searchKeys.restaurant(id), from ?? null] as const,
    queryFn: () => searchApi.getRestaurant(id, from),
  });
}

/** Name of a zone for the screen; the id while the list loads. */
export function getZoneName(zones: Zone[] | undefined, zoneId: string): string {
  return zones?.find((zone) => zone.id === zoneId)?.name ?? zoneId;
}

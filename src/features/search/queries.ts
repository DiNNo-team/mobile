import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchApi } from "./api";
import type { Coordinates, SearchFilters } from "./types";

/**
 * Backup of the socket (Reparto 2.4): results and detail are asked again every 60 s while the app is in the
 * foreground. It also covers changes by schedule, which send no event (a restaurant that opens at 12:00).
 */
export const LIVE_REFETCH_MS = 60_000;

export const searchKeys = {
  all: ["search"] as const,
  /** Every search, whatever the position and filters (the socket updates them all). */
  allRestaurants: () => [...searchKeys.all, "restaurants"] as const,
  restaurants: (location: Coordinates | null, filters: SearchFilters) =>
    [...searchKeys.allRestaurants(), location, filters] as const,
  /** Every detail query of a restaurant starts with this key (the socket of phase 6 updates them by prefix). */
  restaurant: (id: string) => ["restaurant", id] as const,
};

/**
 * GET /search/restaurants without a radius: every restaurant with the chosen filters, measured from the phone when its
 * position is known. While a new search runs, the previous results stay on screen (`isPlaceholderData`), so the map is
 * not rebuilt.
 */
export function useRestaurantSearch(
  location: Coordinates | null,
  filters: SearchFilters,
) {
  return useQuery({
    queryKey: searchKeys.restaurants(location, filters),
    queryFn: () => searchApi.searchRestaurants(location, filters),
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

/** GET /restaurants/:id/public; `from` adds `distanceKm` (only with the phone's position). */
export function useRestaurantDetail(id: string, from: Coordinates | undefined) {
  return useQuery({
    queryKey: [...searchKeys.restaurant(id), from ?? null] as const,
    queryFn: () => searchApi.getRestaurant(id, from),
    refetchInterval: LIVE_REFETCH_MS,
  });
}

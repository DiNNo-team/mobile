import { apiRequest } from "@/lib/api/client";

import type {
  Coordinates,
  RestaurantDetail,
  RestaurantSummary,
  SearchApi,
  SearchFilters,
} from "./types";

/**
 * Query of GET /search/restaurants without `radiusKm` (Sprint 4): every restaurant. With the phone's position it adds
 * `lat` + `lng`, so each one brings its distance and they come closest first.
 */
export function toSearchQuery(
  from: Coordinates | null,
  filters: SearchFilters,
) {
  const place = from ? { lat: from.latitude, lng: from.longitude } : {};
  return { ...place, category: filters.category, partySize: filters.partySize };
}

export const httpSearchApi: SearchApi = {
  searchRestaurants: (from, filters) =>
    apiRequest<RestaurantSummary[]>("/search/restaurants", {
      query: toSearchQuery(from, filters),
    }),
  getRestaurant: (id: string, from?: Coordinates) =>
    apiRequest<RestaurantDetail>(
      `/restaurants/${encodeURIComponent(id)}/public`,
      {
        query: from ? { lat: from.latitude, lng: from.longitude } : undefined,
      },
    ),
};

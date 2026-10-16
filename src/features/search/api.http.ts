import { apiRequest } from '@/lib/api/client';

import type { Coordinates, RestaurantDetail, RestaurantSummary, SearchApi, SearchFilters, SearchOrigin, Zone } from './types';

/** Query of GET /search/restaurants: `lat` + `lng` or `zone`, never both (the backend answers 400). */
export function toSearchQuery(origin: SearchOrigin, filters: SearchFilters) {
  const place =
    origin.type === 'location' ? { lat: origin.latitude, lng: origin.longitude } : { zone: origin.zoneId };
  return { ...place, radiusKm: filters.radiusKm, category: filters.category, partySize: filters.partySize };
}

export const httpSearchApi: SearchApi = {
  getZones: () => apiRequest<Zone[]>('/search/zones'),
  searchRestaurants: (origin, filters) =>
    apiRequest<RestaurantSummary[]>('/search/restaurants', { query: toSearchQuery(origin, filters) }),
  getRestaurant: (id: string, from?: Coordinates) =>
    apiRequest<RestaurantDetail>(`/restaurants/${encodeURIComponent(id)}/public`, {
      query: from ? { lat: from.latitude, lng: from.longitude } : undefined,
    }),
};

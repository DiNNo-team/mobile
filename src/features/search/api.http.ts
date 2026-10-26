import { apiRequest } from '@/lib/api/client';

import type {
  Coordinates,
  GeocodeResult,
  RestaurantDetail,
  RestaurantSummary,
  SearchApi,
  SearchFilters,
  SearchOrigin,
  Zone,
} from './types';

/**
 * Query of GET /search/restaurants: `lat` + `lng` or `zone`, never both (the backend answers 400). An address
 * searches like the phone's position, with the point GET /geocode gave (the search never receives `address`).
 */
export function toSearchQuery(origin: SearchOrigin, filters: SearchFilters) {
  const place = origin.type === 'zone' ? { zone: origin.zoneId } : { lat: origin.latitude, lng: origin.longitude };
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
  geocode: (address: string) => apiRequest<GeocodeResult>('/geocode', { query: { address } }),
};

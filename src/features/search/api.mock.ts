import { ApiError, ErrorCode } from '@/lib/api/errors';
import { distanceKm } from '@/lib/geo';

import { MOCK_RESTAURANTS, MOCK_ZONES, type MockRestaurant } from './mock-data';
import type { Coordinates, RestaurantDetail, RestaurantSummary, SearchApi, SearchFilters, SearchOrigin } from './types';

const MOCK_LATENCY_MS = 400;
const MAX_RESULTS = 50;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

function resolveOrigin(origin: SearchOrigin): Coordinates {
  if (origin.type === 'location') return origin;
  const zone = MOCK_ZONES.find((item) => item.id === origin.zoneId);
  if (!zone) throw new ApiError({ status: 400, kind: 'http', message: 'La zona no existe.' });
  return zone;
}

function toSummary(restaurant: MockRestaurant, from: Coordinates): RestaurantSummary {
  const { id, name, category, address, latitude, longitude, availability } = restaurant;
  return { id, name, category, address, latitude, longitude, availability, distanceKm: distanceKm(from, restaurant) };
}

function toDetail(restaurant: MockRestaurant, from?: Coordinates): RestaurantDetail {
  const { searchable: _searchable, maxFreeCapacity: _maxFreeCapacity, ...detail } = restaurant;
  return from ? { ...detail, distanceKm: distanceKm(from, restaurant) } : detail;
}

/** Same rules as the backend search: searchable only, radius, category, party size, by distance, max 50. */
export function searchMockRestaurants(origin: SearchOrigin, filters: SearchFilters): RestaurantSummary[] {
  const from = resolveOrigin(origin);
  return MOCK_RESTAURANTS.filter((restaurant) => restaurant.searchable)
    .filter((restaurant) => !filters.category || restaurant.category === filters.category)
    .filter((restaurant) => !filters.partySize || restaurant.maxFreeCapacity >= filters.partySize)
    .map((restaurant) => toSummary(restaurant, from))
    .filter((summary) => summary.distanceKm <= filters.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);
}

export const mockSearchApi: SearchApi = {
  async getZones() {
    await wait();
    return MOCK_ZONES;
  },
  async searchRestaurants(origin, filters) {
    await wait();
    return searchMockRestaurants(origin, filters);
  },
  async getRestaurant(id, from) {
    await wait();
    const restaurant = MOCK_RESTAURANTS.find((item) => item.id === id);
    if (!restaurant) {
      throw new ApiError({ status: 404, kind: 'http', errorCode: ErrorCode.RestaurantNotFound });
    }
    return toDetail(restaurant, from);
  },
};

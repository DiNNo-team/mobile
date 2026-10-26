import { ApiError, ErrorCode } from '@/lib/api/errors';
import { distanceKm } from '@/lib/geo';

import { MOCK_RESTAURANTS, MOCK_ZONES, type MockRestaurant } from './mock-data';
import type {
  Coordinates,
  GeocodeResult,
  RestaurantDetail,
  RestaurantSummary,
  SearchApi,
  SearchFilters,
  SearchOrigin,
} from './types';

const MOCK_LATENCY_MS = 400;
const MAX_RESULTS = 50;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

function resolveOrigin(origin: SearchOrigin): Coordinates {
  if (origin.type !== 'zone') return origin;
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

/** Point of the example addresses: the Calle 72 with Carrera 9, where the example restaurants are. */
const MOCK_ADDRESS_POINT: Coordinates = { latitude: 4.6576, longitude: -74.0567 };
const FIRST_STREET_NUMBER = /\b(?:calle|cl|carrera|cra|kr|avenida|av|diagonal|dg|transversal|tv)\.?\s*(\d+)/i;
/** Bogotá's streets and carreras do not go this high: like the backend, the address is not in Bogotá. */
const MAX_BOGOTA_STREET = 200;

/**
 * Example answers of GET /geocode, same shape and codes as the backend: "Medellín" or a street number above 200
 * → 404 ADDRESS_NOT_FOUND; "sin servicio" → 503 GEOCODING_UNAVAILABLE; anything else → a point on the Calle 72.
 */
export function geocodeMockAddress(address: string): GeocodeResult {
  const text = address.trim();
  const street = Number(FIRST_STREET_NUMBER.exec(text)?.[1] ?? 0);
  if (/medell[ií]n/i.test(text) || street > MAX_BOGOTA_STREET) {
    throw new ApiError({ status: 404, kind: 'http', errorCode: ErrorCode.AddressNotFound });
  }
  if (/sin servicio/i.test(text)) {
    throw new ApiError({ status: 503, kind: 'http', errorCode: ErrorCode.GeocodingUnavailable });
  }
  return { ...MOCK_ADDRESS_POINT, formattedAddress: `${text}, Bogotá, Colombia` };
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
  async geocode(address) {
    await wait();
    return geocodeMockAddress(address);
  },
};

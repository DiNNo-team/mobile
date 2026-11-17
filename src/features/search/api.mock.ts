import { ApiError, ErrorCode } from "@/lib/api/errors";
import { distanceKm } from "@/lib/geo";

import { MOCK_RESTAURANTS, type MockRestaurant } from "./mock-data";
import type {
  Coordinates,
  RestaurantDetail,
  RestaurantSummary,
  SearchApi,
  SearchFilters,
} from "./types";

const MOCK_LATENCY_MS = 400;
const MAX_RESULTS = 500;

const wait = () =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

function toSummary(
  restaurant: MockRestaurant,
  from: Coordinates | null,
): RestaurantSummary {
  const { id, name, category, address, latitude, longitude, availability } =
    restaurant;
  return {
    id,
    name,
    category,
    address,
    latitude,
    longitude,
    availability,
    distanceKm: from ? distanceKm(from, restaurant) : null,
  };
}

/** Closest first with the phone's position; by name without it (same order as the backend). */
function byDistanceOrName(a: RestaurantSummary, b: RestaurantSummary): number {
  if (a.distanceKm !== null && b.distanceKm !== null)
    return a.distanceKm - b.distanceKm;
  return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
}

/** Same as the reservations mock: its reservations last 3 minutes (like the expiry demo). */
const MOCK_RESERVATION_TTL_MINUTES = 3;

function toDetail(
  restaurant: MockRestaurant,
  from?: Coordinates,
): RestaurantDetail {
  const {
    searchable: _searchable,
    maxFreeCapacity: _maxFreeCapacity,
    ...rest
  } = restaurant;
  const detail = {
    ...rest,
    reservationTtlMinutes: MOCK_RESERVATION_TTL_MINUTES,
  };
  return from
    ? { ...detail, distanceKm: distanceKm(from, restaurant) }
    : detail;
}

/** Same rules as the backend search without a radius: searchable only, category, party size, sorted, max 500. */
export function searchMockRestaurants(
  from: Coordinates | null,
  filters: SearchFilters,
): RestaurantSummary[] {
  return MOCK_RESTAURANTS.filter((restaurant) => restaurant.searchable)
    .filter(
      (restaurant) =>
        !filters.category || restaurant.category === filters.category,
    )
    .filter(
      (restaurant) =>
        !filters.partySize || restaurant.maxFreeCapacity >= filters.partySize,
    )
    .map((restaurant) => toSummary(restaurant, from))
    .sort(byDistanceOrName)
    .slice(0, MAX_RESULTS);
}

export const mockSearchApi: SearchApi = {
  async searchRestaurants(from, filters) {
    await wait();
    return searchMockRestaurants(from, filters);
  },
  async getRestaurant(id, from) {
    await wait();
    const restaurant = MOCK_RESTAURANTS.find((item) => item.id === id);
    if (!restaurant) {
      throw new ApiError({
        status: 404,
        kind: "http",
        errorCode: ErrorCode.RestaurantNotFound,
      });
    }
    return toDetail(restaurant, from);
  },
};

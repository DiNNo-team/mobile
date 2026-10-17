// Contract of CLAUDE.md §10 (Elizabeth): /search/zones, /search/restaurants and /restaurants/:id/public.
// A contract change touches this file first.

/** The only four values; the app never shows a number of tables. */
export type Availability = 'available' | 'few' | 'none' | 'closed';

/** Backend categories, same order as the web (`frontend/src/features/restaurant/types.ts`). */
export const RESTAURANT_CATEGORIES = [
  'colombian',
  'italian',
  'mexican',
  'asian',
  'grill',
  'fast_food',
  'healthy',
  'seafood',
  'cafe',
  'other',
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

/** Same texts as the web, so both products name a category the same way. */
export const RESTAURANT_CATEGORY_LABELS: Record<RestaurantCategory, string> = {
  colombian: 'Colombiana',
  italian: 'Italiana',
  mexican: 'Mexicana',
  asian: 'Asiática',
  grill: 'Parrilla',
  fast_food: 'Comida rápida',
  healthy: 'Saludable',
  seafood: 'Mariscos',
  cafe: 'Cafetería',
  other: 'Otra',
};

/** Label of a category, or null when the restaurant has none yet. */
export function getCategoryLabel(category: RestaurantCategory | null): string | null {
  return category ? RESTAURANT_CATEGORY_LABELS[category] : null;
}

/** Shown when a restaurant has no address yet (category and address can be null, CLAUDE.md §10). */
export const ADDRESS_FALLBACK = 'Dirección por confirmar';

export const RADIUS_OPTIONS_KM = [1, 2, 5, 10] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];
export const DEFAULT_RADIUS_KM: RadiusKm = 2;

export const PARTY_SIZE_LIMITS = { min: 1, max: 20 } as const;

/** GET /search/zones item. */
export interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/** Where the search is centered: the phone's GPS or one zone of the closed list (never both). */
export type SearchOrigin =
  | { type: 'location'; latitude: number; longitude: number }
  | { type: 'zone'; zoneId: string };

export interface SearchFilters {
  radiusKm: RadiusKm;
  category?: RestaurantCategory;
  partySize?: number;
}

/** GET /search/restaurants item, ordered by distance (max 50). */
export interface RestaurantSummary {
  id: string;
  name: string;
  /** Null in restaurants created before the full sign-up (Sprint 1): show nothing instead. */
  category: RestaurantCategory | null;
  /** Null in restaurants created before the full sign-up: show `ADDRESS_FALLBACK`. */
  address: string | null;
  latitude: number;
  longitude: number;
  /** Kilometers with 2 decimals; the app formats it ("a 650 m", "a 1,4 km"). */
  distanceKm: number;
  availability: Availability;
}

/** One open day. 1 = Monday … 7 = Sunday; `closesAt < opensAt` closes the next day; closed days are absent. */
export interface Schedule {
  dayOfWeek: number;
  isOpen24h: boolean;
  opensAt: string | null;
  closesAt: string | null;
}

/** GET /restaurants/:id/public. `distanceKm` only when `lat` and `lng` were sent. */
export interface RestaurantDetail {
  id: string;
  name: string;
  category: RestaurantCategory | null;
  address: string | null;
  latitude: number;
  longitude: number;
  schedules: Schedule[];
  isOpenNow: boolean;
  availability: Availability;
  distanceKm?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SearchApi {
  getZones(): Promise<Zone[]>;
  searchRestaurants(origin: SearchOrigin, filters: SearchFilters): Promise<RestaurantSummary[]>;
  getRestaurant(id: string, from?: Coordinates): Promise<RestaurantDetail>;
}

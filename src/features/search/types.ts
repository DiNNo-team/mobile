// Contract of CLAUDE.md §10 (Elizabeth): /search/restaurants and /restaurants/:id/public. Since Sprint 4 the app
// searches every restaurant (no zone, address or radius) and filters by name on screen.
// A contract change touches this file first.

/** The only four values; the app never shows a number of tables. */
export type Availability = "available" | "few" | "none" | "closed";

/** Backend categories, same order as the web (`frontend/src/features/restaurant/types.ts`). */
export const RESTAURANT_CATEGORIES = [
  "colombian",
  "italian",
  "mexican",
  "asian",
  "grill",
  "fast_food",
  "healthy",
  "seafood",
  "cafe",
  "other",
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

/** Same texts as the web, so both products name a category the same way. */
export const RESTAURANT_CATEGORY_LABELS: Record<RestaurantCategory, string> = {
  colombian: "Colombiana",
  italian: "Italiana",
  mexican: "Mexicana",
  asian: "Asiática",
  grill: "Parrilla",
  fast_food: "Comida rápida",
  healthy: "Saludable",
  seafood: "Mariscos",
  cafe: "Cafetería",
  other: "Otra",
};

/** Label of a category, or null when the restaurant has none yet. */
export function getCategoryLabel(
  category: RestaurantCategory | null,
): string | null {
  return category ? RESTAURANT_CATEGORY_LABELS[category] : null;
}

/** Shown when a restaurant has no address yet (category and address can be null, CLAUDE.md §10). */
export const ADDRESS_FALLBACK = "Dirección por confirmar";

export const PARTY_SIZE_LIMITS = { min: 1, max: 20 } as const;

export interface SearchFilters {
  category?: RestaurantCategory;
  partySize?: number;
}

/** GET /search/restaurants item without a radius: every restaurant, by distance with the phone's position, else by name. */
export interface RestaurantSummary {
  id: string;
  name: string;
  /** Null in restaurants created before the full sign-up (Sprint 1): show nothing instead. */
  category: RestaurantCategory | null;
  /** Null in restaurants created before the full sign-up: show `ADDRESS_FALLBACK`. */
  address: string | null;
  latitude: number;
  longitude: number;
  /** Kilometers with 2 decimals; the app formats it ("a 650 m", "a 1,4 km"). Null without the phone's position. */
  distanceKm: number | null;
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
  /**
   * Sprint 3: how long a reservation lasts right now, in minutes (2–15; 3 during the expiry demo). Only informative
   * before reserving: the countdown always comes from `expiresAt` and `serverTime` of the reservation.
   */
  reservationTtlMinutes?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SearchApi {
  /** Every restaurant that can be booked now; `from` (the phone's position) adds the distance and sorts by it. */
  searchRestaurants(
    from: Coordinates | null,
    filters: SearchFilters,
  ): Promise<RestaurantSummary[]>;
  getRestaurant(id: string, from?: Coordinates): Promise<RestaurantDetail>;
}

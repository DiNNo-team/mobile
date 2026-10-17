import type { Availability, RestaurantDetail, RestaurantSummary } from '@/features/search/types';

/** Server event `availability.changed` (CLAUDE.md §10, "Tiempo real"). */
export const AVAILABILITY_CHANGED = 'availability.changed';

export interface AvailabilityChangedEvent {
  restaurantId: string;
  availability: Availability;
  isOpenNow: boolean;
  /** Meets the rules to appear in the search (without filters). */
  isSearchable: boolean;
}

const AVAILABILITY_VALUES: readonly string[] = ['available', 'few', 'none', 'closed'] satisfies Availability[];

/** The socket is outside TypeScript: anything that is not exactly the contract is ignored. */
export function isAvailabilityChangedEvent(value: unknown): value is AvailabilityChangedEvent {
  if (typeof value !== 'object' || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.restaurantId === 'string' &&
    typeof event.availability === 'string' &&
    AVAILABILITY_VALUES.includes(event.availability) &&
    typeof event.isOpenNow === 'boolean' &&
    typeof event.isSearchable === 'boolean'
  );
}

/**
 * Search results after an event, at once and without waiting for the server: not searchable → it leaves the
 * list and the map; otherwise its availability changes. A restaurant that is not in the list is left to the
 * refetch (the event has no name, address or coordinates). Returns the same array when nothing changes.
 */
export function applyToResults(
  results: RestaurantSummary[] | undefined,
  event: AvailabilityChangedEvent,
): RestaurantSummary[] | undefined {
  if (!results?.some((restaurant) => restaurant.id === event.restaurantId)) return results;
  if (!event.isSearchable) return results.filter((restaurant) => restaurant.id !== event.restaurantId);
  return results.map((restaurant) =>
    restaurant.id === event.restaurantId ? { ...restaurant, availability: event.availability } : restaurant,
  );
}

/** The open detail after an event: it stays on screen and shows "Cerrado" when the restaurant closes. */
export function applyToDetail(detail: RestaurantDetail | undefined, event: AvailabilityChangedEvent): RestaurantDetail | undefined {
  if (!detail || detail.id !== event.restaurantId) return detail;
  return { ...detail, availability: event.availability, isOpenNow: event.isOpenNow };
}

/** Socket.IO does not retry a rejected handshake: with SERVER_ERROR the app waits 5 s, 15 s, then every 30 s. */
export const SERVER_ERROR_RETRY_MS = [5_000, 15_000, 30_000] as const;

export function getRetryDelay(attempt: number): number {
  return SERVER_ERROR_RETRY_MS[Math.min(attempt, SERVER_ERROR_RETRY_MS.length - 1)];
}

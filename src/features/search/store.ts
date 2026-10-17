import { create } from 'zustand';

import { onSignOut } from '@/features/session/SessionProvider';

import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS_KM, type Coordinates, type RadiusKm, type RestaurantCategory, type SearchFilters, type SearchOrigin } from './types';

interface SearchState {
  /** Null until the diner chooses: the phone's position or a zone. */
  origin: SearchOrigin | null;
  filters: SearchFilters;
  setLocation: (coordinates: Coordinates) => void;
  setZone: (zoneId: string) => void;
  setRadius: (radiusKm: RadiusKm) => void;
  setCategory: (category: RestaurantCategory | undefined) => void;
  setPartySize: (partySize: number | undefined) => void;
  /** Applies the filters sheet at once ("Ver restaurantes"). */
  setFilters: (filters: SearchFilters) => void;
  /** Back to the general search: default radius, no category, no party size. The origin stays. */
  clearFilters: () => void;
  /** Everything back to the start (sign out). */
  reset: () => void;
}

const DEFAULT_FILTERS: SearchFilters = { radiusKm: DEFAULT_RADIUS_KM };

/**
 * Search kept across screens (Reparto: "un store global ligero"), so the origin and the filters survive
 * going to the detail and back. Server data stays in TanStack Query; this holds only what the diner chose.
 */
export const useSearchStore = create<SearchState>()((set) => ({
  origin: null,
  filters: DEFAULT_FILTERS,
  setLocation: ({ latitude, longitude }) => set({ origin: { type: 'location', latitude, longitude } }),
  setZone: (zoneId) => set({ origin: { type: 'zone', zoneId } }),
  setRadius: (radiusKm) => set((state) => ({ filters: { ...state.filters, radiusKm } })),
  setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  setPartySize: (partySize) => set((state) => ({ filters: { ...state.filters, partySize } })),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  reset: () => set({ origin: null, filters: DEFAULT_FILTERS }),
}));

onSignOut(() => useSearchStore.getState().reset());

/** Next radius of the list (1 → 2 → 5 → 10), or null at 10 km: the "Ampliar a X km" action. */
export function getNextRadius(radiusKm: RadiusKm): RadiusKm | null {
  const index = RADIUS_OPTIONS_KM.indexOf(radiusKm);
  return RADIUS_OPTIONS_KM[index + 1] ?? null;
}

/** Coordinates to send to the detail (`distanceKm`), only when the search uses the phone's position. */
export function getOriginCoordinates(origin: SearchOrigin | null): Coordinates | undefined {
  return origin?.type === 'location' ? { latitude: origin.latitude, longitude: origin.longitude } : undefined;
}

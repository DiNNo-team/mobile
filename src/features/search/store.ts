import { create } from "zustand";

import { onSignOut } from "@/features/session/SessionProvider";

import type { Coordinates, RestaurantCategory, SearchFilters } from "./types";

interface SearchState {
  /** The phone's position, only when the diner allowed it: adds the distance and sorts by it. Null otherwise. */
  location: Coordinates | null;
  /** What the diner typed in «Buscar restaurante»: filters the results by name on screen. */
  query: string;
  filters: SearchFilters;
  setLocation: (coordinates: Coordinates) => void;
  setQuery: (query: string) => void;
  setCategory: (category: RestaurantCategory | undefined) => void;
  setPartySize: (partySize: number | undefined) => void;
  /** Applies the filters sheet at once ("Ver restaurantes"). */
  setFilters: (filters: SearchFilters) => void;
  /** Back to every restaurant: no category, no party size. The position and the typed name stay. */
  clearFilters: () => void;
  /** Everything back to the start (sign out). */
  reset: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {};

/**
 * Search kept across screens (Reparto: "un store global ligero"), so the typed name and the filters survive going to
 * the detail and back. Server data stays in TanStack Query; this holds only what the diner chose.
 */
export const useSearchStore = create<SearchState>()((set) => ({
  location: null,
  query: "",
  filters: DEFAULT_FILTERS,
  setLocation: ({ latitude, longitude }) =>
    set({ location: { latitude, longitude } }),
  setQuery: (query) => set({ query }),
  setCategory: (category) =>
    set((state) => ({ filters: { ...state.filters, category } })),
  setPartySize: (partySize) =>
    set((state) => ({ filters: { ...state.filters, partySize } })),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  reset: () => set({ location: null, query: "", filters: DEFAULT_FILTERS }),
}));

onSignOut(() => useSearchStore.getState().reset());

import {
  getCategoryLabel,
  type Coordinates,
  type RestaurantSummary,
  type SearchFilters,
} from "./types";

export type FilterKey = "category" | "partySize";

export interface ActiveFilter {
  key: FilterKey;
  label: string;
}

/** "1 persona", "4 personas" (manual 14.1: capacidad). */
export function formatPartySize(partySize: number): string {
  return partySize === 1 ? "1 persona" : `${partySize} personas`;
}

/** Filters that differ from the general search, shown as removable chips (Reparto: "los filtros activos se ven como chips"). */
export function getActiveFilters(filters: SearchFilters): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  const category = filters.category ? getCategoryLabel(filters.category) : null;
  if (category) active.push({ key: "category", label: category });
  if (filters.partySize)
    active.push({
      key: "partySize",
      label: formatPartySize(filters.partySize),
    });
  return active;
}

/** The filters without one of them (the chip's "x"). */
export function removeFilter(
  filters: SearchFilters,
  key: FilterKey,
): SearchFilters {
  return { ...filters, [key]: undefined };
}

/** Lowercase and without accents, so «cafe» finds «Café» and «nam» finds «Ñam». */
function normalizeName(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .trim();
}

/**
 * «Buscar restaurante» (Sprint 4): the restaurants whose name contains what the diner typed, ignoring case and
 * accents. An empty search keeps them all.
 */
export function filterByName(
  restaurants: RestaurantSummary[],
  query: string,
): RestaurantSummary[] {
  const wanted = normalizeName(query);
  if (!wanted) return restaurants;
  return restaurants.filter((restaurant) =>
    normalizeName(restaurant.name).includes(wanted),
  );
}

/** "Cómo llegar": universal Google Maps URL, no API (Reparto, free services only). */
export function getDirectionsUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

import { DEFAULT_RADIUS_KM, getCategoryLabel, type Coordinates, type SearchFilters } from './types';

export type FilterKey = 'category' | 'partySize' | 'radiusKm';

export interface ActiveFilter {
  key: FilterKey;
  label: string;
}

/** "1 persona", "4 personas" (manual 14.1: capacidad). */
export function formatPartySize(partySize: number): string {
  return partySize === 1 ? '1 persona' : `${partySize} personas`;
}

/** Filters that differ from the general search, shown as removable chips (Reparto: "los filtros activos se ven como chips"). */
export function getActiveFilters(filters: SearchFilters): ActiveFilter[] {
  const active: ActiveFilter[] = [];
  const category = filters.category ? getCategoryLabel(filters.category) : null;
  if (category) active.push({ key: 'category', label: category });
  if (filters.partySize) active.push({ key: 'partySize', label: formatPartySize(filters.partySize) });
  if (filters.radiusKm !== DEFAULT_RADIUS_KM) active.push({ key: 'radiusKm', label: `A ${filters.radiusKm} km` });
  return active;
}

/** The filters without one of them (the chip's "x"). */
export function removeFilter(filters: SearchFilters, key: FilterKey): SearchFilters {
  if (key === 'radiusKm') return { ...filters, radiusKm: DEFAULT_RADIUS_KM };
  return { ...filters, [key]: undefined };
}

/** "Cómo llegar": universal Google Maps URL, no API (Reparto, free services only). */
export function getDirectionsUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

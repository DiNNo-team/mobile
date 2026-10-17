import type { Availability } from '@/features/search/types';

/** Manual 3.1: each state is color + shape + word. */
export type StatusShapeKind = 'dot' | 'diamond' | 'striped-square' | 'dash';
export type StatusColor = 'ok' | 'limited' | 'busy' | 'inactive';

export interface StatusPresentation {
  label: string;
  color: StatusColor;
  shape: StatusShapeKind;
  /** Live information (manual 0.7): the shape pulses softly, e.g. "Abierto". */
  live?: boolean;
}

/** Manual 3.4 for shape and color; words of Reparto 2.2 / CLAUDE.md §10. Never a number of tables. */
export const AVAILABILITY_PRESENTATION: Record<Availability, StatusPresentation> = {
  available: { label: 'Disponible', color: 'ok', shape: 'dot' },
  few: { label: 'Pocas mesas', color: 'limited', shape: 'diamond' },
  none: { label: 'Sin mesas', color: 'busy', shape: 'striped-square' },
  closed: { label: 'Cerrado', color: 'inactive', shape: 'dash' },
};

/** Manual 3.3: operating state of the restaurant in the detail. */
export const OPEN_STATUS_PRESENTATION: Record<'open' | 'closed', StatusPresentation> = {
  open: { label: 'Abierto', color: 'ok', shape: 'dot', live: true },
  closed: { label: 'Cerrado', color: 'inactive', shape: 'dash' },
};

export function getAvailabilityPresentation(availability: Availability): StatusPresentation {
  return AVAILABILITY_PRESENTATION[availability];
}

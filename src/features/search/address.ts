import { onSignOut } from '@/features/session/SessionProvider';
import { ApiError, ErrorCode, getErrorMessage, isApiError } from '@/lib/api/errors';

import { searchApi } from './api';
import type { GeocodeResult, SearchApi } from './types';

/** Same limits as GET /geocode (CLAUDE.md §10): shorter or longer answers 400, so they are checked here first. */
export const ADDRESS_LENGTH = { min: 3, max: 255 } as const;

export const ADDRESS_TEXT = {
  label: 'Buscar por dirección',
  placeholder: 'Ej.: Calle 72 # 10-34',
  search: 'Buscar dirección',
  searching: 'Buscando…',
  empty: 'Escribe una dirección.',
  tooShort: `Escribe al menos ${ADDRESS_LENGTH.min} caracteres.`,
  tooLong: `Usa máximo ${ADDRESS_LENGTH.max} caracteres.`,
  // The backend message is neutral: the app picks its own text by errorCode (Elizabeth, 26 oct).
  notFound: 'No encontramos esa dirección en Bogotá. Revisa la dirección o elige una zona.',
  unavailable: 'No pudimos ubicar la dirección en este momento. Intenta de nuevo o elige una zona.',
} as const;

/** One line, single spaces: line breaks are not allowed by the backend and spaces do not change the address. */
export function normalizeAddress(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Error of the field before calling the backend, or undefined if the address can be looked up. */
export function validateAddress(text: string): string | undefined {
  const address = normalizeAddress(text);
  if (!address) return ADDRESS_TEXT.empty;
  if (address.length < ADDRESS_LENGTH.min) return ADDRESS_TEXT.tooShort;
  if (address.length > ADDRESS_LENGTH.max) return ADDRESS_TEXT.tooLong;
  return undefined;
}

/** Text of a failed lookup: 404 and 503 by errorCode; network, timeout or server errors as everywhere else. */
export function getAddressErrorMessage(error: unknown): string {
  if (isApiError(error, ErrorCode.AddressNotFound)) return ADDRESS_TEXT.notFound;
  if (isApiError(error, ErrorCode.GeocodingUnavailable)) return ADDRESS_TEXT.unavailable;
  return getErrorMessage(error);
}

// Answers already known while the app is open. GET /geocode spends Google's daily quota shared with the web
// (Sprint 2 closing notes, point 6): the same address is never asked twice. "Not in Bogotá" does not change
// either, so it is remembered too; a 503 or a network error is not, so "Intentar de nuevo" asks again.
const found = new Map<string, GeocodeResult>();
const notFound = new Set<string>();

onSignOut(() => {
  found.clear();
  notFound.clear();
});

/** Lowercase and normalized: "calle 72  # 10-34" and "Calle 72 # 10-34" are the same lookup. */
function cacheKey(address: string): string {
  return normalizeAddress(address).toLowerCase();
}

/**
 * Address → point with GET /geocode, only when the diner confirms (never while typing). Throws the ApiError of
 * the backend; `getAddressErrorMessage` turns it into the text of the screen.
 */
export async function locateAddress(address: string, api: Pick<SearchApi, 'geocode'> = searchApi): Promise<GeocodeResult> {
  const key = cacheKey(address);
  const known = found.get(key);
  if (known) return known;
  if (notFound.has(key)) throw new ApiError({ status: 404, kind: 'http', errorCode: ErrorCode.AddressNotFound });
  try {
    const result = await api.geocode(normalizeAddress(address));
    found.set(key, result);
    return result;
  } catch (error) {
    if (isApiError(error, ErrorCode.AddressNotFound)) notFound.add(key);
    throw error;
  }
}

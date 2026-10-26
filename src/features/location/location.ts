import * as Location from 'expo-location';

import type { Coordinates } from '@/features/search/types';

/** Reparto 2.3 / 9: the position must arrive within 10 s, otherwise the app moves on to zones. */
export const LOCATION_TIMEOUT_MS = 10_000;
/** A position the phone got this recently is good enough to search around and answers at once. */
const RECENT_POSITION_MAX_AGE_MS = 60_000;
const RECENT_POSITION_MAX_ERROR_M = 200;

/**
 * `ask`: the app can show the system dialog (first time, or denied once).
 * `blocked`: denied for good; only the phone settings can change it.
 */
export type LocationPermission = 'granted' | 'ask' | 'blocked';

/** Why the phone's position could not be used. Each one has its own text (`LOCATION_FAILURE_MESSAGES`). */
export type LocationFailure = 'denied' | 'blocked' | 'services-off' | 'timeout' | 'unavailable';

export type LocationResult = { ok: true; coordinates: Coordinates } | { ok: false; failure: LocationFailure };

function toPermission(response: Location.LocationPermissionResponse): LocationPermission {
  if (response.granted) return 'granted';
  return response.canAskAgain ? 'ask' : 'blocked';
}

/** Current permission, without asking. */
export async function getLocationPermission(): Promise<LocationPermission> {
  return toPermission(await Location.getForegroundPermissionsAsync());
}

/** Shows the system dialog (only after the explanation screen) and returns the answer. */
export async function requestLocationPermission(): Promise<LocationPermission> {
  return toPermission(await Location.requestForegroundPermissionsAsync());
}

const TIMED_OUT = Symbol('timed-out');

/** `task`, or `TIMED_OUT` if it takes longer than `ms`. The timer is cleared when the task wins. */
async function withTimeout<T>(task: Promise<T>, ms: number): Promise<T | typeof TIMED_OUT> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMED_OUT), ms);
  });
  try {
    return await Promise.race([task, expired]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Position of the phone with the permission already granted: a recent one if the phone has it, otherwise a
 * new one. GPS off → `services-off`, nothing within `timeoutMs` → `timeout`, any other error → `unavailable`.
 * Never throws. `High` accuracy turns the GPS on; `Balanced` relies on Wi-Fi and cell networks, which the
 * emulator does not have, so `adb emu geo fix` would never arrive.
 */
export async function getCurrentCoordinates(timeoutMs: number = LOCATION_TIMEOUT_MS): Promise<LocationResult> {
  try {
    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, failure: 'services-off' };
    const recent = await Location.getLastKnownPositionAsync({
      maxAge: RECENT_POSITION_MAX_AGE_MS,
      requiredAccuracy: RECENT_POSITION_MAX_ERROR_M,
    });
    const position = recent ?? (await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }), timeoutMs));
    if (position === TIMED_OUT) return { ok: false, failure: 'timeout' };
    const { latitude, longitude } = position.coords;
    return { ok: true, coordinates: { latitude, longitude } };
  } catch {
    return { ok: false, failure: 'unavailable' };
  }
}

/**
 * The whole step after the explanation: permission (asking only when `ask` is true) and then the position.
 * Without permission it answers `denied` (said no now) or `blocked` (said no for good).
 */
export async function locateDevice({ ask }: { ask: boolean }): Promise<LocationResult> {
  let permission: LocationPermission;
  try {
    permission = await getLocationPermission();
    if (permission === 'ask' && ask) permission = await requestLocationPermission();
  } catch {
    return { ok: false, failure: 'unavailable' };
  }
  if (permission === 'blocked') return { ok: false, failure: 'blocked' };
  if (permission === 'ask') return { ok: false, failure: 'denied' };
  return getCurrentCoordinates();
}

/** What happened + what to do (manual 14). The screen then offers the zones. */
export const LOCATION_FAILURE_MESSAGES: Record<LocationFailure, string> = {
  denied: 'No usaremos tu ubicación. Busca por dirección o elige una zona para ver restaurantes cerca.',
  blocked: 'DiNNo no tiene permiso para usar tu ubicación. Actívalo en los ajustes del teléfono o busca por dirección o zona.',
  'services-off': 'La ubicación del teléfono está apagada. Actívala e intenta de nuevo, o busca por dirección o zona.',
  timeout: 'No pudimos encontrar tu ubicación a tiempo. Intenta de nuevo o busca por dirección o zona.',
  unavailable: 'No pudimos encontrar tu ubicación. Intenta de nuevo o busca por dirección o zona.',
};

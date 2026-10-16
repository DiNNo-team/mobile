import type { AccountApi, Me } from '@/features/account/types';
import { ApiError, ErrorCode, isSessionExpired } from '@/lib/api/errors';

/** Where the session lands after Firebase says who the person is (Reparto 2.1, CLAUDE.md §10). */
export type ProfileResolution =
  | { kind: 'diner'; profile: Me }
  | { kind: 'restaurant-account' }
  | { kind: 'email-not-verified' }
  | { kind: 'session-expired' }
  | { kind: 'unreachable'; error: unknown };

/** `POST /diners/me` accepts 1–60 characters (CLAUDE.md §10). */
export const DISPLAY_NAME_MAX_LENGTH = 60;

function cleanDisplayName(displayName: string | undefined): string | undefined {
  const name = displayName?.trim();
  return name ? [...name].slice(0, DISPLAY_NAME_MAX_LENGTH).join('').trim() : undefined;
}

function fromError(error: unknown): ProfileResolution {
  if (error instanceof ApiError) {
    if (error.errorCode === ErrorCode.EmailNotVerified) return { kind: 'email-not-verified' };
    if (error.errorCode === ErrorCode.RestaurantAccount) return { kind: 'restaurant-account' };
    if (isSessionExpired(error)) return { kind: 'session-expired' };
  }
  return { kind: 'unreachable', error };
}

/** The role comes from the backend; the app only reacts to it. */
function fromProfile(profile: Me): ProfileResolution {
  return profile.role === 'diner' ? { kind: 'diner', profile } : { kind: 'restaurant-account' };
}

/**
 * The single flow after any sign-in (email, Google, sign-up): `GET /me`; without a profile
 * (`PROFILE_REQUIRED`) it creates the diner with `POST /diners/me` and continues.
 * A restaurant account gets 200 from `/me` with its role (or 403 `RESTAURANT_ACCOUNT` from `/diners/me`).
 */
export async function resolveDinerProfile(api: AccountApi, displayName?: string): Promise<ProfileResolution> {
  try {
    return fromProfile(await api.getMe());
  } catch (error) {
    if (!(error instanceof ApiError && error.errorCode === ErrorCode.ProfileRequired)) return fromError(error);
  }
  try {
    const name = cleanDisplayName(displayName);
    return fromProfile(await api.createDinerProfile(name ? { displayName: name } : {}));
  } catch (error) {
    return fromError(error);
  }
}

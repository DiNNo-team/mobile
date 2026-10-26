import type { Me } from './types';

/** Name on the Profile tab: `displayName`, or the part of the email before `@` when it is missing (CLAUDE.md §10). */
export function getDisplayName(profile: Pick<Me, 'displayName' | 'email'>): string {
  const name = profile.displayName?.trim();
  if (name) return name;
  return profile.email.split('@')[0];
}

/** "Versión 1.0.0" under the Profile tab; null when the build has no version. */
export function formatAppVersion(version: string | null | undefined): string | null {
  const value = version?.trim();
  return value ? `Versión ${value}` : null;
}

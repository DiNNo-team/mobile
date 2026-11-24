/**
 * The local «Tu reserva vence pronto» reminder (Sprint 4; the MVP lists «vencimiento próximo»). It is scheduled on the
 * phone, so it works on iOS without remote push and with no network. Pure, so it is tested without the native module.
 */

const MINUTE = 60_000;

/** 5 minutes before the end; 1 minute when the reservation lasts 5 or less (the 3-minute TTL of the expiry demo). */
export function reminderLeadMs(durationMs: number): number {
  return durationMs > 5 * MINUTE ? 5 * MINUTE : MINUTE;
}

/**
 * Seconds from now until the reminder, or null when it is too late for one (less than the lead left) or the
 * reservation is already over. `remainingMs` comes from the server clock (`timer.ts`), never the phone's alone.
 */
export function reminderDelaySeconds(remainingMs: number, durationMs: number): number | null {
  const delay = remainingMs - reminderLeadMs(durationMs);
  return delay >= 1000 ? Math.floor(delay / 1000) : null;
}

/** The lead in whole minutes (5 or 1), for the reminder body. */
export function leadMinutes(durationMs: number): number {
  return reminderLeadMs(durationMs) / MINUTE;
}

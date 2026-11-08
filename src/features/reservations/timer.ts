// Time left of a reservation (CLAUDE.md §12.1): the server clock rules. `expiresAt − serverTime` is what was left when
// the server answered; from then on we subtract the time measured with a monotonic clock (`performance.now()`), so
// changing the phone's clock never moves the countdown (QA case M4). The same function lives in the web.
// Android's monotonic clock may stop while the phone sleeps: the screen asks the server again when the app comes back
// to the foreground and every 30 s, which re-anchors `receivedAt`.

/** Milliseconds left, never below 0. `receivedAt` and `now` come from the same monotonic clock. */
export function remainingMs(expiresAt: string, serverTime: string, receivedAt: number, now: number): number {
  const leftAtAnswer = Date.parse(expiresAt) - Date.parse(serverTime);
  if (Number.isNaN(leftAtAnswer)) return 0;
  return Math.max(0, leftAtAnswer - Math.max(0, now - receivedAt));
}

/** "12:34" (a 15-minute reservation shows 15:00). Partial seconds count up: 0.2 s → 00:01. */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** «12 minutos y 34 segundos», for TalkBack (the visible "12:34" is read badly). */
export function spokenCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
  if (seconds > 0 || minutes === 0) parts.push(`${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`);
  return parts.join(' y ');
}

/** The monotonic clock of the platform (React Native and Hermes expose `performance.now()`). */
export function monotonicNow(): number {
  return performance.now();
}

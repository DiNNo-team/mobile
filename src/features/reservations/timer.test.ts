import { formatCountdown, remainingMs, spokenCountdown } from './timer';

const SERVER = '2026-11-08T17:00:00.000Z';
const EXPIRES = '2026-11-08T17:12:34.000Z';

describe('remainingMs (the server clock rules, case M4)', () => {
  it('is expiresAt − serverTime at the answer, minus the monotonic time since then', () => {
    expect(remainingMs(EXPIRES, SERVER, 1_000, 1_000)).toBe(754_000);
    expect(remainingMs(EXPIRES, SERVER, 1_000, 61_000)).toBe(694_000);
  });

  it('a phone clock minutes ahead or behind changes nothing: Date.now() is never read', () => {
    const realNow = Date.now;
    try {
      Date.now = () => Date.parse('2030-01-01T00:00:00Z');
      expect(remainingMs(EXPIRES, SERVER, 0, 30_000)).toBe(724_000);
      Date.now = () => Date.parse('2001-01-01T00:00:00Z');
      expect(remainingMs(EXPIRES, SERVER, 0, 30_000)).toBe(724_000);
    } finally {
      Date.now = realNow;
    }
  });

  it('a new answer re-anchors the count (after the monotonic clock stopped while the phone slept)', () => {
    // Slept 5 min without the clock moving: still 754 s on screen. The refetch on returning brings the truth.
    expect(remainingMs(EXPIRES, SERVER, 0, 0)).toBe(754_000);
    expect(remainingMs(EXPIRES, '2026-11-08T17:05:00.000Z', 0, 0)).toBe(454_000);
  });

  it('never goes below 0; an expired or unreadable one reads 0', () => {
    expect(remainingMs(EXPIRES, SERVER, 0, 900_000)).toBe(0);
    expect(remainingMs(SERVER, EXPIRES, 0, 0)).toBe(0);
    expect(remainingMs('nope', SERVER, 0, 0)).toBe(0);
  });
});

describe('formatCountdown and spokenCountdown', () => {
  it('mm:ss, partial seconds count up', () => {
    expect(formatCountdown(754_000)).toBe('12:34');
    expect(formatCountdown(900_000)).toBe('15:00');
    expect(formatCountdown(200)).toBe('00:01');
    expect(formatCountdown(0)).toBe('00:00');
  });

  it('reads minutes and seconds with singular', () => {
    expect(spokenCountdown(754_000)).toBe('12 minutos y 34 segundos');
    expect(spokenCountdown(61_000)).toBe('1 minuto y 1 segundo');
    expect(spokenCountdown(120_000)).toBe('2 minutos');
  });
});

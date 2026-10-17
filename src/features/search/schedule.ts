import type { Schedule } from './types';

/** 1 = lunes … 7 = domingo, as in `schedules[].dayOfWeek` (CLAUDE.md §10). */
export const DAY_NAMES: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

/** "HH:MM" (24 h, backend) → "7:30 p. m." (12 h, manual 10). */
export function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours < 12 ? 'a. m.' : 'p. m.';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export interface DaySchedule {
  dayOfWeek: number;
  day: string;
  /** "12:00 p. m. – 11:00 p. m.", "Abierto 24 horas" or "Cerrado". */
  hours: string;
  /** Closes after midnight: the screen adds "(día siguiente)". */
  closesNextDay: boolean;
  closed: boolean;
}

/** The seven days, Monday first. Days missing from `schedules` are closed. */
export function getWeekSchedule(schedules: Schedule[]): DaySchedule[] {
  return [1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => {
    const day = DAY_NAMES[dayOfWeek];
    const schedule = schedules.find((item) => item.dayOfWeek === dayOfWeek);
    if (!schedule) return { dayOfWeek, day, hours: 'Cerrado', closesNextDay: false, closed: true };
    if (schedule.isOpen24h || !schedule.opensAt || !schedule.closesAt) {
      return { dayOfWeek, day, hours: 'Abierto 24 horas', closesNextDay: false, closed: false };
    }
    return {
      dayOfWeek,
      day,
      hours: `${formatTime12h(schedule.opensAt)} – ${formatTime12h(schedule.closesAt)}`,
      closesNextDay: schedule.closesAt < schedule.opensAt,
      closed: false,
    };
  });
}

/** Bogotá is UTC−5 all year (no daylight saving time). */
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

/** Today in Bogotá as 1 = lunes … 7 = domingo, whatever the phone's time zone. */
export function getBogotaDayOfWeek(now: Date = new Date()): number {
  const day = new Date(now.getTime() + BOGOTA_OFFSET_MS).getUTCDay();
  return day === 0 ? 7 : day;
}

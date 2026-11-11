import { getActiveFilters, getDirectionsUrl, removeFilter } from './filters';
import { formatShortTime12h, formatTime12h, getBogotaDayOfWeek, getTodayClosing, getWeekSchedule } from './schedule';

describe('formatTime12h (manual 10: "7:30 p. m.")', () => {
  it.each([
    ['00:00', '12:00 a. m.'],
    ['07:30', '7:30 a. m.'],
    ['12:00', '12:00 p. m.'],
    ['19:30', '7:30 p. m.'],
    ['23:05', '11:05 p. m.'],
  ])('%s → %s', (time, expected) => expect(formatTime12h(time)).toBe(expected));
});

describe('getWeekSchedule (C9: cierre al día siguiente, 24 horas)', () => {
  const week = getWeekSchedule([
    { dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '22:00' },
    { dayOfWeek: 5, isOpen24h: false, opensAt: '18:00', closesAt: '02:00' },
    { dayOfWeek: 6, isOpen24h: true, opensAt: null, closesAt: null },
  ]);

  it('always lists the 7 days, Monday first', () => {
    expect(week.map((day) => day.day)).toEqual(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  });

  it('normal day, closing the next day, 24 hours and closed', () => {
    expect(week[0]).toMatchObject({ hours: '12:00 p. m. – 10:00 p. m.', closesNextDay: false, closed: false });
    expect(week[4]).toMatchObject({ hours: '6:00 p. m. – 2:00 a. m.', closesNextDay: true });
    expect(week[5]).toMatchObject({ hours: 'Abierto 24 horas', closesNextDay: false });
    expect(week[1]).toMatchObject({ hours: 'Cerrado', closed: true });
  });
});

describe('getBogotaDayOfWeek', () => {
  it('uses Bogotá time (UTC−5), not the phone zone', () => {
    // Monday 03:00 UTC is still Sunday 22:00 in Bogotá.
    expect(getBogotaDayOfWeek(new Date('2026-10-19T03:00:00Z'))).toBe(7);
    expect(getBogotaDayOfWeek(new Date('2026-10-19T05:00:00Z'))).toBe(1);
  });
});

describe('filters', () => {
  it('active chips: category, people and a radius other than 2 km', () => {
    expect(getActiveFilters({ radiusKm: 2 })).toEqual([]);
    expect(getActiveFilters({ radiusKm: 5, category: 'seafood', partySize: 1 }).map((filter) => filter.label)).toEqual([
      'Mariscos',
      '1 persona',
      'A 5 km',
    ]);
  });

  it('removing a chip goes back to the general value', () => {
    expect(removeFilter({ radiusKm: 10, partySize: 4 }, 'radiusKm')).toEqual({ radiusKm: 2, partySize: 4 });
    expect(removeFilter({ radiusKm: 2, partySize: 4 }, 'partySize')).toEqual({ radiusKm: 2, partySize: undefined });
  });

  it('"Cómo llegar" uses the universal URL with the coordinates', () => {
    expect(getDirectionsUrl({ latitude: 4.6576, longitude: -74.0567 })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=4.6576,-74.0567',
    );
  });
});

describe('getTodayClosing (mobile v3: «10 p. m.» · «Cierra hoy»)', () => {
  // Wednesday 11 nov 2026, 15:00 in Bogotá (20:00 UTC).
  const wednesday = new Date('2026-11-11T20:00:00Z');

  it('drops ":00" from round hours only', () => {
    expect(formatShortTime12h('22:00')).toBe('10 p. m.');
    expect(formatShortTime12h('22:30')).toBe('10:30 p. m.');
  });

  it('reads today in Bogotá', () => {
    expect(getTodayClosing([{ dayOfWeek: 3, isOpen24h: false, opensAt: '12:00', closesAt: '22:00' }], wednesday)).toEqual({
      value: '10 p. m.',
      label: 'Cierra hoy',
    });
  });

  it('after midnight, 24 hours and closed days', () => {
    expect(getTodayClosing([{ dayOfWeek: 3, isOpen24h: false, opensAt: '18:00', closesAt: '02:00' }], wednesday)).toEqual({
      value: '2 a. m.',
      label: 'Cierra',
    });
    expect(getTodayClosing([{ dayOfWeek: 3, isOpen24h: true, opensAt: null, closesAt: null }], wednesday).value).toBe('24 horas');
    expect(getTodayClosing([], wednesday)).toEqual({ value: 'Cerrado', label: 'Hoy' });
  });
});

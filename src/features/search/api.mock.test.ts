import { ApiError } from '@/lib/api/errors';

import { toSearchQuery } from './api.http';
import { searchMockRestaurants } from './api.mock';
import { MOCK_RESTAURANTS } from './mock-data';

const calle72 = { type: 'zone', zoneId: 'calle-72' } as const;

describe('mock search follows the backend rules', () => {
  it('returns only searchable restaurants inside the radius, nearest first', () => {
    const results = searchMockRestaurants(calle72, { radiusKm: 2 });
    const hidden = MOCK_RESTAURANTS.filter((restaurant) => !restaurant.searchable).map((restaurant) => restaurant.id);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.distanceKm <= 2)).toBe(true);
    expect(results.some((result) => hidden.includes(result.id))).toBe(false);
    expect(results.map((result) => result.distanceKm)).toEqual([...results.map((r) => r.distanceKm)].sort((a, b) => a - b));
  });

  it('never returns closed and covers the three search levels', () => {
    const levels = new Set(searchMockRestaurants(calle72, { radiusKm: 10 }).map((result) => result.availability));
    expect(levels).toEqual(new Set(['available', 'few', 'none']));
  });

  it('filters by category and party size', () => {
    expect(searchMockRestaurants(calle72, { radiusKm: 10, category: 'italian' }).map((r) => r.name)).toEqual([
      'Trattoria Quinta',
    ]);
    const forSix = searchMockRestaurants(calle72, { radiusKm: 10, partySize: 6 });
    expect(forSix.map((result) => result.name).sort()).toEqual(['Brasa Chapinero', 'Casa 72', 'Fonda Teusaquillo']);
  });

  it('rejects an unknown zone with a 400', () => {
    expect(() => searchMockRestaurants({ type: 'zone', zoneId: 'narnia' }, { radiusKm: 2 })).toThrow(ApiError);
  });

  it('a location far from Bogotá has no results', () => {
    expect(searchMockRestaurants({ type: 'location', latitude: 6.2442, longitude: -75.5812 }, { radiusKm: 10 })).toEqual([]);
  });
});

describe('toSearchQuery', () => {
  it('sends lat/lng or zone, never both', () => {
    expect(toSearchQuery({ type: 'location', latitude: 4.65, longitude: -74.05 }, { radiusKm: 2 })).toEqual({
      lat: 4.65,
      lng: -74.05,
      radiusKm: 2,
      category: undefined,
      partySize: undefined,
    });
    const byZone = toSearchQuery(calle72, { radiusKm: 5, category: 'cafe', partySize: 2 });
    expect(byZone).toEqual({ zone: 'calle-72', radiusKm: 5, category: 'cafe', partySize: 2 });
    expect(byZone).not.toHaveProperty('lat');
  });
});

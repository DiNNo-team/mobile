import type { RestaurantDetail, RestaurantSummary } from '@/features/search/types';

import { applyToDetail, applyToResults, getRetryDelay, isAvailabilityChangedEvent, type AvailabilityChangedEvent } from './availability-cache';

const summary = (id: string, availability: RestaurantSummary['availability'] = 'available'): RestaurantSummary => ({
  id,
  name: `Restaurante ${id}`,
  category: 'colombian',
  address: 'Calle 72 # 9-10',
  latitude: 4.65,
  longitude: -74.05,
  distanceKm: 0.2,
  availability,
});

const event = (change: Partial<AvailabilityChangedEvent> = {}): AvailabilityChangedEvent => ({
  restaurantId: 'casa-72',
  availability: 'few',
  isOpenNow: true,
  isSearchable: true,
  ...change,
});

describe('isAvailabilityChangedEvent', () => {
  it('accepts exactly the contract and nothing else', () => {
    expect(isAvailabilityChangedEvent(event())).toBe(true);
    expect(isAvailabilityChangedEvent({ ...event(), availability: '3 mesas' })).toBe(false);
    expect(isAvailabilityChangedEvent({ restaurantId: 'x', availability: 'few' })).toBe(false);
    expect(isAvailabilityChangedEvent(null)).toBe(false);
  });
});

describe('applyToResults (C10: disponibilidad en vivo)', () => {
  const results = [summary('casa-72'), summary('otro', 'none')];

  it('changes the availability of the restaurant in the list', () => {
    expect(applyToResults(results, event())?.map((r) => r.availability)).toEqual(['few', 'none']);
  });

  it('a restaurant that closes (not searchable) leaves the list and the map', () => {
    expect(applyToResults(results, event({ availability: 'closed', isOpenNow: false, isSearchable: false }))?.map((r) => r.id)).toEqual([
      'otro',
    ]);
  });

  it('a restaurant that is not in the list waits for the refetch; same array when nothing changes', () => {
    expect(applyToResults(results, event({ restaurantId: 'nuevo' }))).toBe(results);
    expect(applyToResults(undefined, event())).toBeUndefined();
  });
});

describe('applyToDetail', () => {
  const detail: RestaurantDetail = { ...summary('casa-72'), schedules: [], isOpenNow: true };

  it('the open detail shows "Cerrado" when the restaurant closes', () => {
    expect(applyToDetail(detail, event({ availability: 'closed', isOpenNow: false, isSearchable: false }))).toMatchObject({
      availability: 'closed',
      isOpenNow: false,
    });
  });

  it('ignores events of other restaurants', () => {
    expect(applyToDetail(detail, event({ restaurantId: 'otro' }))).toBe(detail);
  });
});

describe('getRetryDelay (SERVER_ERROR)', () => {
  it('waits 5 s, 15 s and then every 30 s', () => {
    expect([0, 1, 2, 3, 9].map(getRetryDelay)).toEqual([5_000, 15_000, 30_000, 30_000, 30_000]);
  });
});

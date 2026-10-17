import { toSearchQuery } from './api.http';
import { getNextRadius, getOriginCoordinates, useSearchStore } from './store';

const signOutCleanups: (() => void)[] = [];
jest.mock('@/features/session/SessionProvider', () => ({
  onSignOut: (cleanup: () => void) => {
    signOutCleanups.push(cleanup);
    return () => undefined;
  },
}));

const CALLE_72 = { latitude: 4.6583, longitude: -74.0563 };

beforeEach(() => useSearchStore.getState().reset());

describe('search store', () => {
  it('starts without an origin and with the default radius of 2 km', () => {
    expect(useSearchStore.getState().origin).toBeNull();
    expect(useSearchStore.getState().filters).toEqual({ radiusKm: 2 });
  });

  it('position and zone replace each other: the query never has both', () => {
    const { setLocation, setZone } = useSearchStore.getState();
    setLocation(CALLE_72);
    setZone('chapinero');
    const { origin, filters } = useSearchStore.getState();
    expect(toSearchQuery(origin!, filters)).toEqual({ zone: 'chapinero', radiusKm: 2, category: undefined, partySize: undefined });
    setLocation(CALLE_72);
    expect(toSearchQuery(useSearchStore.getState().origin!, filters)).toMatchObject({ lat: 4.6583, lng: -74.0563 });
    expect(toSearchQuery(useSearchStore.getState().origin!, filters)).not.toHaveProperty('zone');
  });

  it('clearing filters keeps the origin; signing out forgets everything', () => {
    const { setZone, setRadius, setCategory, setPartySize, clearFilters } = useSearchStore.getState();
    setZone('zona-g');
    setRadius(5);
    setCategory('italian');
    setPartySize(4);
    clearFilters();
    expect(useSearchStore.getState()).toMatchObject({ origin: { type: 'zone', zoneId: 'zona-g' }, filters: { radiusKm: 2 } });
    signOutCleanups.forEach((cleanup) => cleanup());
    expect(useSearchStore.getState().origin).toBeNull();
  });
});

describe('helpers', () => {
  it('next radius for "Ampliar a X km": 1 → 2 → 5 → 10 → none', () => {
    expect(getNextRadius(1)).toBe(2);
    expect(getNextRadius(2)).toBe(5);
    expect(getNextRadius(5)).toBe(10);
    expect(getNextRadius(10)).toBeNull();
  });

  it('the detail gets coordinates only from the phone position', () => {
    expect(getOriginCoordinates({ type: 'location', ...CALLE_72 })).toEqual(CALLE_72);
    expect(getOriginCoordinates({ type: 'zone', zoneId: 'chapinero' })).toBeUndefined();
    expect(getOriginCoordinates(null)).toBeUndefined();
  });
});

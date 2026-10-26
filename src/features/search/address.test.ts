import { ApiError, ErrorCode } from '@/lib/api/errors';

import { ADDRESS_TEXT, getAddressErrorMessage, locateAddress, normalizeAddress, validateAddress } from './address';
import { toSearchQuery } from './api.http';
import { geocodeMockAddress } from './api.mock';
import type { GeocodeResult } from './types';

// The real backend is never called in tests: GET /geocode spends Google's daily quota (closing notes, point 6).
const signOutCleanups: (() => void)[] = [];
jest.mock('@/features/session/SessionProvider', () => ({
  onSignOut: (cleanup: () => void) => {
    signOutCleanups.push(cleanup);
    return () => undefined;
  },
}));
jest.mock('./api', () => ({ searchApi: { geocode: jest.fn() } }));

const POINT: GeocodeResult = { latitude: 4.6577, longitude: -74.0573, formattedAddress: 'Cra. 11 #72-30, Bogotá, Colombia' };
const notFound = () => new ApiError({ status: 404, kind: 'http', errorCode: ErrorCode.AddressNotFound });
const unavailable = () => new ApiError({ status: 503, kind: 'http', errorCode: ErrorCode.GeocodingUnavailable });

beforeEach(() => signOutCleanups.forEach((cleanup) => cleanup()));

describe('validateAddress (before calling the backend)', () => {
  it('needs 3 to 255 characters, ignoring extra spaces and line breaks', () => {
    expect(validateAddress('   ')).toBe(ADDRESS_TEXT.empty);
    expect(validateAddress('ab')).toBe(ADDRESS_TEXT.tooShort);
    expect(validateAddress(' a\n b ')).toBeUndefined();
    expect(validateAddress('x'.repeat(256))).toBe(ADDRESS_TEXT.tooLong);
    expect(normalizeAddress('  Calle 72\n# 10-34 ')).toBe('Calle 72 # 10-34');
  });
});

describe('getAddressErrorMessage (by errorCode, never the backend message)', () => {
  it('404 and 503 have their own text; the rest, the usual network texts', () => {
    expect(getAddressErrorMessage(notFound())).toBe(ADDRESS_TEXT.notFound);
    expect(getAddressErrorMessage(unavailable())).toBe(ADDRESS_TEXT.unavailable);
    expect(getAddressErrorMessage(new ApiError({ status: 0, kind: 'network' }))).toMatch(/conectarnos/);
  });
});

describe('locateAddress (cares for the Geocoding quota)', () => {
  it('asks once per address: the same address, with other spaces or case, comes from memory', async () => {
    const geocode = jest.fn().mockResolvedValue(POINT);
    await expect(locateAddress('Cra. 11 #72-30', { geocode })).resolves.toEqual(POINT);
    await expect(locateAddress('  cra. 11   #72-30 ', { geocode })).resolves.toEqual(POINT);
    expect(geocode).toHaveBeenCalledTimes(1);
    expect(geocode).toHaveBeenCalledWith('Cra. 11 #72-30');
  });

  it('remembers "not in Bogotá" too, but asks again after a 503', async () => {
    const geocode = jest.fn().mockRejectedValueOnce(notFound()).mockRejectedValueOnce(unavailable()).mockResolvedValue(POINT);
    await expect(locateAddress('Calle 10 #43A-30, Medellín', { geocode })).rejects.toMatchObject({ errorCode: 'ADDRESS_NOT_FOUND' });
    await expect(locateAddress('Calle 10 #43A-30, Medellín', { geocode })).rejects.toMatchObject({ errorCode: 'ADDRESS_NOT_FOUND' });
    await expect(locateAddress('Calle 93A #11A-31', { geocode })).rejects.toMatchObject({ errorCode: 'GEOCODING_UNAVAILABLE' });
    await expect(locateAddress('Calle 93A #11A-31', { geocode })).resolves.toEqual(POINT);
    expect(geocode).toHaveBeenCalledTimes(3);
  });

  it('signing out forgets the answers', async () => {
    const geocode = jest.fn().mockResolvedValue(POINT);
    await locateAddress('Calle 118 #5-41', { geocode });
    signOutCleanups.forEach((cleanup) => cleanup());
    await locateAddress('Calle 118 #5-41', { geocode });
    expect(geocode).toHaveBeenCalledTimes(2);
  });
});

describe('searching by address', () => {
  it('searches with the point like the GPS: lat/lng, never `address` nor `zone`', () => {
    const query = toSearchQuery({ type: 'address', ...POINT, query: 'Cra. 11 #72-30' }, { radiusKm: 2, partySize: 4 });
    expect(query).toEqual({ lat: 4.6577, lng: -74.0573, radiusKm: 2, category: undefined, partySize: 4 });
  });

  it('example data answers like the backend (Medellín and impossible streets → 404, "sin servicio" → 503)', () => {
    expect(geocodeMockAddress('Cra. 11 #72-30')).toMatchObject({ formattedAddress: 'Cra. 11 #72-30, Bogotá, Colombia' });
    expect(() => geocodeMockAddress('Calle 10 #43A-30, Medellín')).toThrow(expect.objectContaining({ errorCode: 'ADDRESS_NOT_FOUND' }));
    expect(() => geocodeMockAddress('Carrera 300 # 500-99')).toThrow(expect.objectContaining({ errorCode: 'ADDRESS_NOT_FOUND' }));
    expect(() => geocodeMockAddress('sin servicio')).toThrow(expect.objectContaining({ errorCode: 'GEOCODING_UNAVAILABLE' }));
  });
});

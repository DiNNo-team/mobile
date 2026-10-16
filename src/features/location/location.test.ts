import * as Location from 'expo-location';

import { getCurrentCoordinates, LOCATION_FAILURE_MESSAGES, LOCATION_TIMEOUT_MS, locateDevice } from './location';

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
}));

const mocked = jest.mocked(Location);
const permission = (granted: boolean, canAskAgain = true) =>
  ({ granted, canAskAgain, status: granted ? 'granted' : 'denied', expires: 'never' }) as Location.LocationPermissionResponse;
const CALLE_72 = { latitude: 4.6583, longitude: -74.0563 };

beforeEach(() => {
  jest.resetAllMocks();
  mocked.hasServicesEnabledAsync.mockResolvedValue(true);
  mocked.getCurrentPositionAsync.mockResolvedValue({ coords: CALLE_72, timestamp: 0 } as Location.LocationObject);
  mocked.getLastKnownPositionAsync.mockResolvedValue(null);
});

describe('locateDevice (C3: permiso de ubicación)', () => {
  it('granted → coordinates, without showing the dialog again', async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue(permission(true));
    await expect(locateDevice({ ask: true })).resolves.toEqual({ ok: true, coordinates: CALLE_72 });
    expect(mocked.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('asks only when allowed, and a "no" is `denied`', async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue(permission(false));
    mocked.requestForegroundPermissionsAsync.mockResolvedValue(permission(false));
    await expect(locateDevice({ ask: false })).resolves.toEqual({ ok: false, failure: 'denied' });
    expect(mocked.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    await expect(locateDevice({ ask: true })).resolves.toEqual({ ok: false, failure: 'denied' });
    expect(mocked.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('denied for good → `blocked`, never shows the dialog', async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue(permission(false, false));
    await expect(locateDevice({ ask: true })).resolves.toEqual({ ok: false, failure: 'blocked' });
    expect(mocked.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('GPS off → `services-off`', async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue(permission(true));
    mocked.hasServicesEnabledAsync.mockResolvedValue(false);
    await expect(locateDevice({ ask: true })).resolves.toEqual({ ok: false, failure: 'services-off' });
  });

  it('a native error → `unavailable`, never throws', async () => {
    mocked.getForegroundPermissionsAsync.mockRejectedValue(new Error('native'));
    await expect(locateDevice({ ask: true })).resolves.toEqual({ ok: false, failure: 'unavailable' });
    mocked.getForegroundPermissionsAsync.mockResolvedValue(permission(true));
    mocked.getCurrentPositionAsync.mockRejectedValue(new Error('no fix'));
    await expect(locateDevice({ ask: true })).resolves.toEqual({ ok: false, failure: 'unavailable' });
  });
});

describe('getCurrentCoordinates', () => {
  afterEach(() => jest.useRealTimers());

  it('uses a recent position of the phone without waiting for a new one', async () => {
    const zonaG = { latitude: 4.6497, longitude: -74.0587 };
    mocked.getLastKnownPositionAsync.mockResolvedValue({ coords: zonaG, timestamp: 0 } as Location.LocationObject);
    await expect(getCurrentCoordinates()).resolves.toEqual({ ok: true, coordinates: zonaG });
    expect(mocked.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('gives up after 10 s → `timeout`', async () => {
    jest.useFakeTimers();
    mocked.getCurrentPositionAsync.mockReturnValue(new Promise(() => undefined));
    const result = getCurrentCoordinates();
    await jest.advanceTimersByTimeAsync(LOCATION_TIMEOUT_MS);
    await expect(result).resolves.toEqual({ ok: false, failure: 'timeout' });
  });

  it('every failure has a text that offers the zones', () => {
    Object.values(LOCATION_FAILURE_MESSAGES).forEach((message) => expect(message).toMatch(/zona/));
  });
});

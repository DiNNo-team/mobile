import type * as GoogleModule from './google';

// Each test loads a fresh copy of google.ts: it keeps state (configured, pending sign-out) between calls.

type GoogleSigninMock = {
  configure: jest.Mock;
  hasPlayServices: jest.Mock;
  signIn: jest.Mock;
  signOut: jest.Mock;
  hasPreviousSignIn: jest.Mock;
};

const mockEnv = { useMocks: false, googleWebClientId: 'web-client.apps.googleusercontent.com' as string | null };

jest.mock('@/config/env', () => ({ env: mockEnv }));
jest.mock('./SessionProvider', () => ({ onSignOut: jest.fn() }));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(),
    signOut: jest.fn(async () => null),
    hasPreviousSignIn: jest.fn(() => false),
  },
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED', PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE' },
  isErrorWithCode: (error: unknown) => typeof error === 'object' && error !== null && 'code' in error,
}));

function load() {
  let google!: typeof GoogleModule;
  let GoogleSignin!: GoogleSigninMock;
  let onSignOut!: jest.Mock;
  jest.isolateModules(() => {
    google = jest.requireActual<typeof GoogleModule>('./google');
    GoogleSignin = jest.requireMock('@react-native-google-signin/google-signin').GoogleSignin;
    onSignOut = jest.requireMock('./SessionProvider').onSignOut;
  });
  const cleanup: () => void = onSignOut.mock.calls[0][0];
  return { google, GoogleSignin, cleanup };
}

const success = (idToken: string | null) => ({
  type: 'success',
  data: { idToken, user: { id: 'g1', email: 'ana@gmail.com', name: 'Ana' } },
});
const nativeError = (code: string) => Object.assign(new Error(code), { code });
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  mockEnv.useMocks = false;
  mockEnv.googleWebClientId = 'web-client.apps.googleusercontent.com';
});

describe('requestGoogleIdToken', () => {
  it('returns the idToken for Firebase, configured with the web client ID', async () => {
    const { google, GoogleSignin } = load();
    GoogleSignin.signIn.mockResolvedValue(success('id-token'));
    await expect(google.requestGoogleIdToken()).resolves.toEqual({ kind: 'token', idToken: 'id-token' });
    expect(GoogleSignin.configure).toHaveBeenCalledWith({ webClientId: 'web-client.apps.googleusercontent.com' });
  });

  it('a closed window is a cancellation, whether answered or thrown', async () => {
    const { google, GoogleSignin } = load();
    GoogleSignin.signIn.mockResolvedValueOnce({ type: 'cancelled', data: null });
    await expect(google.requestGoogleIdToken()).resolves.toEqual({ kind: 'cancelled' });
    GoogleSignin.signIn.mockRejectedValueOnce(nativeError('SIGN_IN_CANCELLED'));
    await expect(google.requestGoogleIdToken()).resolves.toEqual({ kind: 'cancelled' });
  });

  it('errors become clear messages, never technical ones', async () => {
    const { google, GoogleSignin } = load();
    GoogleSignin.hasPlayServices.mockRejectedValueOnce(nativeError('PLAY_SERVICES_NOT_AVAILABLE'));
    await expect(google.requestGoogleIdToken()).resolves.toEqual({
      kind: 'error',
      message: 'Actualiza Google Play Services en tu teléfono e intenta de nuevo.',
    });
    GoogleSignin.signIn.mockRejectedValueOnce(nativeError('10'));
    await expect(google.requestGoogleIdToken()).resolves.toEqual({
      kind: 'error',
      message: 'No pudimos iniciar sesión con Google. Intenta de nuevo.',
    });
    GoogleSignin.signIn.mockResolvedValueOnce(success(null));
    await expect(google.requestGoogleIdToken()).resolves.toMatchObject({ kind: 'error' });
  });

  it('without the web client ID does not open Google', async () => {
    mockEnv.googleWebClientId = null;
    const { google, GoogleSignin } = load();
    await expect(google.requestGoogleIdToken()).resolves.toEqual({
      kind: 'error',
      message: 'Por ahora no puedes continuar con Google. Inicia sesión con tu correo.',
    });
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
  });
});

describe('Google sign-out on "Cerrar sesión"', () => {
  it('signing out of the app forgets the Google account', async () => {
    const { GoogleSignin, cleanup } = load();
    GoogleSignin.hasPreviousSignIn.mockReturnValue(true);
    cleanup();
    await flush();
    expect(GoogleSignin.signOut).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no Google account was used', async () => {
    const { GoogleSignin, cleanup } = load();
    GoogleSignin.hasPreviousSignIn.mockReturnValue(false);
    cleanup();
    await flush();
    expect(GoogleSignin.signOut).not.toHaveBeenCalled();
  });

  it('a failed sign-out is retried before the next Google sign-in', async () => {
    const { google, GoogleSignin, cleanup } = load();
    GoogleSignin.hasPreviousSignIn.mockReturnValue(true);
    GoogleSignin.signOut.mockRejectedValueOnce(new Error('native failure'));
    cleanup();
    await flush();
    GoogleSignin.signIn.mockResolvedValue(success('id-token'));
    await google.requestGoogleIdToken();
    expect(GoogleSignin.signOut).toHaveBeenCalledTimes(2);
    expect(GoogleSignin.signOut.mock.invocationCallOrder[1]).toBeLessThan(GoogleSignin.signIn.mock.invocationCallOrder[0]);
  });

  it('with example data never calls Google', async () => {
    mockEnv.useMocks = true;
    const { google, GoogleSignin } = load();
    await google.signOutOfGoogle();
    expect(GoogleSignin.configure).not.toHaveBeenCalled();
    expect(GoogleSignin.signOut).not.toHaveBeenCalled();
  });
});

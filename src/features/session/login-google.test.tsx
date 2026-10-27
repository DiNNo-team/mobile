import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { act, create, type ReactTestRenderer, type ReactTestRendererNode } from 'react-test-renderer';

import LoginScreen from '@/app/(auth)/login';
import { env } from '@/config/env';

import { requestGoogleIdToken } from './google';
import type { AuthContextValue, SignInOptions } from './SessionProvider';

// "Continuar con Google" on the login, with the session, Firebase and the Google module mocked.

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: { credential: jest.fn((idToken: string) => ({ providerId: 'google.com', idToken })) },
  signInWithCredential: jest.fn(),
}));
jest.mock('./firebase', () => ({ getFirebaseAuth: () => ({ currentUser: null }) }));
jest.mock('./google', () => ({ MOCK_GOOGLE_EMAIL: 'google@dinno.test', requestGoogleIdToken: jest.fn() }));
jest.mock('./SessionProvider', () => ({ useAuth: jest.fn() }));
jest.mock('@/config/env', () => ({ env: { useMocks: false } }));
jest.mock('@/theme/ThemeProvider', () => {
  const { themes } = jest.requireActual('@/theme/tokens');
  return { useTheme: () => ({ colors: themes.light, scheme: 'light' }) };
});
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() }, useFocusEffect: jest.fn() }));
// The kit's barrel loads the animated pieces: native worklets do not exist under jest.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/lib/module/mock'));
// The official mock lacks useReducedMotion (used by the kit's press feedback, manual 11.3).
jest.mock('react-native-reanimated', () => ({ ...jest.requireActual('react-native-reanimated/mock'), useReducedMotion: () => false }));
// lucide-react-native ships ESM that jest does not transform: every icon renders nothing here.
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_, name) => (name === '__esModule' ? true : () => null) }));

const { useAuth } = jest.requireMock<{ useAuth: jest.Mock<Partial<AuthContextValue>> }>('./SessionProvider');
const mockEnv = env as { useMocks: boolean };

/** Like the provider: runs the Firebase action and maps its error with the texts of the screen. */
const signInWithFirebase = jest.fn(async (action: () => Promise<unknown>, options?: SignInOptions) => {
  try {
    await action();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, message: options?.errorMessage?.(error) ?? 'error' };
  }
});
const signInWithEmail = jest.fn(async () => ({ ok: true as const }));

let screen: ReactTestRenderer;

function textOf(node: ReactTestRendererNode | ReactTestRendererNode[] | null): string {
  if (node === null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  return (node.children ?? []).map(textOf).join(' ');
}

const alerts = () => screen.root.findAll((node) => node.props.accessibilityRole === 'alert' && typeof node.type === 'string');

async function pressGoogle() {
  await act(async () => {
    screen = create(<LoginScreen />);
  });
  const button = screen.root.find(
    (node) =>
      node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Continuar con Google' && !!node.props.onPress,
  );
  await act(async () => {
    await button.props.onPress();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEnv.useMocks = false;
  useAuth.mockReturnValue({ notice: null, clearNotice: jest.fn(), signInWithFirebase, signInWithEmail });
});

describe('Continuar con Google', () => {
  it('hands the Google idToken to Firebase through the single flow', async () => {
    jest.mocked(requestGoogleIdToken).mockResolvedValue({ kind: 'token', idToken: 'id-token' });
    await pressGoogle();
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('id-token');
    expect(signInWithCredential).toHaveBeenCalledWith(expect.anything(), { providerId: 'google.com', idToken: 'id-token' });
    expect(signInWithFirebase).toHaveBeenCalledTimes(1);
    expect(alerts()).toHaveLength(0);
  });

  it('closing the Google window shows nothing', async () => {
    jest.mocked(requestGoogleIdToken).mockResolvedValue({ kind: 'cancelled' });
    await pressGoogle();
    expect(signInWithFirebase).not.toHaveBeenCalled();
    expect(alerts()).toHaveLength(0);
  });

  it('a Google error shows its message in an Alert', async () => {
    jest
      .mocked(requestGoogleIdToken)
      .mockResolvedValue({ kind: 'error', message: 'No pudimos iniciar sesión con Google. Intenta de nuevo.' });
    await pressGoogle();
    expect(textOf(screen.toJSON())).toContain('No pudimos iniciar sesión con Google. Intenta de nuevo.');
    expect(alerts()).toHaveLength(1);
  });

  it('a Firebase error after Google uses the Google texts', async () => {
    jest.mocked(requestGoogleIdToken).mockResolvedValue({ kind: 'token', idToken: 'id-token' });
    jest
      .mocked(signInWithCredential)
      .mockRejectedValue(Object.assign(new Error('net'), { code: 'auth/network-request-failed' }));
    await pressGoogle();
    expect(textOf(screen.toJSON())).toContain('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
  });

  it('with example data signs in as the example diner without calling Google', async () => {
    mockEnv.useMocks = true;
    await pressGoogle();
    expect(requestGoogleIdToken).not.toHaveBeenCalled();
    expect(signInWithEmail).toHaveBeenCalledWith('google@dinno.test', 'google');
  });
});

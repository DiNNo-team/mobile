import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { TextInput } from 'react-native';
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
  type ReactTestRendererNode,
} from 'react-test-renderer';

import SignUpScreen from '@/app/(auth)/crear-cuenta';
import RecoverPasswordScreen from '@/app/(auth)/recuperar-contrasena';
import VerifyEmailScreen from '@/app/(auth)/verificar-correo';

import type { AuthContextValue, SignInOptions } from './SessionProvider';

// Screens of the sign-up flow with the session and Firebase mocked: what the diner sees after each action.

const mockShowToast = jest.fn();
const firebaseUser = { uid: 'u1' };

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
jest.mock('./firebase', () => ({ getFirebaseAuth: () => ({ currentUser: { uid: 'u1' } }) }));
jest.mock('./SessionProvider', () => ({ useAuth: jest.fn() }));
jest.mock('@/config/env', () => ({ env: { useMocks: false } }));
jest.mock('@/theme/ThemeProvider', () => {
  const { themes } = jest.requireActual('@/theme/tokens');
  return { useTheme: () => ({ colors: themes.light, scheme: 'light' }) };
});
jest.mock('@/components/ui/Toast', () => ({ useToast: () => ({ showToast: mockShowToast, hideToast: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() }, useFocusEffect: jest.fn() }));
// The kit's barrel loads the animated pieces: native worklets do not exist under jest.
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/lib/module/mock'));
// The official mock lacks useReducedMotion (used by the kit's press feedback, manual 11.3).
jest.mock('react-native-reanimated', () => ({ ...jest.requireActual('react-native-reanimated/mock'), useReducedMotion: () => false }));
// lucide-react-native ships ESM that jest does not transform: every icon renders nothing here.
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_, name) => (name === '__esModule' ? true : () => null) }));

const { useAuth } = jest.requireMock<{ useAuth: jest.Mock<Partial<AuthContextValue>> }>('./SessionProvider');

/** Like the provider: runs the Firebase action and maps its error with the texts of the screen. */
const signInWithFirebase = jest.fn(async (action: () => Promise<unknown>, options?: SignInOptions) => {
  try {
    await action();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, message: options?.errorMessage?.(error) ?? 'error' };
  }
});
const reloadEmailVerification = jest.fn<Promise<boolean>, []>();
const signOut = jest.fn(async () => {});

let screen: ReactTestRenderer;

async function render(element: React.ReactElement) {
  await act(async () => {
    screen = create(element);
  });
}

function textOf(node: ReactTestRendererNode | ReactTestRendererNode[] | null): string {
  if (node === null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  return (node.children ?? []).map(textOf).join(' ');
}

const screenText = () => textOf(screen.toJSON());

function field(label: string): ReactTestInstance {
  return screen.root.find((node) => node.type === TextInput && node.props.accessibilityLabel === label);
}

async function type(label: string, value: string) {
  await act(async () => {
    field(label).props.onChangeText(value);
  });
}

async function blur(label: string) {
  await act(async () => {
    field(label).props.onBlur({});
  });
}

async function press(label: string) {
  const button = screen.root.find(
    (node) => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === label && !!node.props.onPress,
  );
  await act(async () => {
    await button.props.onPress();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: { uid: 'u1', email: 'ana@correo.com', displayName: 'Ana', emailVerified: false },
    signInWithFirebase,
    signInWithEmail: jest.fn(),
    reloadEmailVerification,
    signOut,
  });
});

describe('Crear cuenta', () => {
  it('validates when leaving a field, not on each key', async () => {
    await render(<SignUpScreen />);
    await type('Contraseña', '123');
    expect(field('Contraseña').props.accessibilityHint).toBe('Mínimo 8 caracteres.');
    await blur('Contraseña');
    expect(field('Contraseña').props.accessibilityHint).toBe('Usa al menos 8 caracteres.');
    await type('Correo', 'ana@correo');
    expect(field('Correo').props.accessibilityHint).toBeUndefined();
    await blur('Correo');
    expect(field('Correo').props.accessibilityHint).toBe('Escribe un correo válido, por ejemplo ana@correo.com.');
  });

  it('on submit with every field empty marks the three and does not call Firebase', async () => {
    await render(<SignUpScreen />);
    await press('Crear cuenta');
    expect(screenText()).toContain('Revisa los 3 campos marcados.');
    expect(screenText()).toContain('Escribe tu nombre.');
    expect(screenText()).toContain('Escribe tu correo.');
    expect(screenText()).toContain('Escribe una contraseña.');
    expect(signInWithFirebase).not.toHaveBeenCalled();
  });

  it('creates the account, sends the verification email and passes the name', async () => {
    jest.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: firebaseUser } as never);
    await render(<SignUpScreen />);
    await type('Nombre', '  Ana María ');
    await type('Correo', 'ana@correo.com');
    await type('Contraseña', 'clave-segura');
    await press('Crear cuenta');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'ana@correo.com', 'clave-segura');
    expect(sendEmailVerification).toHaveBeenCalledWith(firebaseUser);
    expect(signInWithFirebase.mock.calls[0][1]).toMatchObject({ displayName: 'Ana María' });
  });

  it('an email already in use shows its message in an Alert', async () => {
    jest
      .mocked(createUserWithEmailAndPassword)
      .mockRejectedValue(Object.assign(new Error('in use'), { code: 'auth/email-already-in-use' }));
    await render(<SignUpScreen />);
    await type('Nombre', 'Ana');
    await type('Correo', 'ana@correo.com');
    await type('Contraseña', 'clave-segura');
    await press('Crear cuenta');
    expect(screenText()).toContain('Ya hay una cuenta con este correo. Inicia sesión o usa otro correo.');
    expect(screen.root.findAll((node) => node.props.accessibilityRole === 'alert').length).toBeGreaterThan(0);
  });
});

describe('Verificar correo', () => {
  it('shows the email of the account', async () => {
    await render(<VerifyEmailScreen />);
    expect(screenText()).toContain('ana@correo.com');
  });

  it('"Ya lo verifiqué" while still unverified says so', async () => {
    reloadEmailVerification.mockResolvedValue(false);
    await render(<VerifyEmailScreen />);
    await press('Ya lo verifiqué');
    expect(screenText()).toContain('Todavía no vemos tu correo verificado.');
  });

  it('"Ya lo verifiqué" once verified lets the session continue, with no message', async () => {
    reloadEmailVerification.mockResolvedValue(true);
    await render(<VerifyEmailScreen />);
    await press('Ya lo verifiqué');
    expect(reloadEmailVerification).toHaveBeenCalledTimes(1);
    expect(screenText()).not.toContain('Todavía no vemos tu correo verificado.');
  });

  it('"Reenviar correo" confirms with a toast', async () => {
    jest.mocked(sendEmailVerification).mockResolvedValue();
    await render(<VerifyEmailScreen />);
    await press('Reenviar correo');
    expect(sendEmailVerification).toHaveBeenCalledWith(firebaseUser);
    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('"Reenviar correo" too many times shows the rate limit message', async () => {
    jest
      .mocked(sendEmailVerification)
      .mockRejectedValue(Object.assign(new Error('limit'), { code: 'auth/too-many-requests' }));
    await render(<VerifyEmailScreen />);
    await press('Reenviar correo');
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(screenText()).toContain('Hay demasiados intentos. Espera un momento e inténtalo de nuevo.');
  });

  it('"Cerrar sesión" signs out', async () => {
    await render(<VerifyEmailScreen />);
    await press('Cerrar sesión');
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('Recuperar contraseña', () => {
  it('asks for the email before sending', async () => {
    await render(<RecoverPasswordScreen />);
    await press('Enviar enlace');
    expect(screenText()).toContain('Escribe tu correo.');
  });

  it('confirms without revealing whether the account exists', async () => {
    await render(<RecoverPasswordScreen />);
    await type('Correo', 'ana@correo.com');
    await press('Enviar enlace');
    expect(screenText()).toContain('Si hay una cuenta con ese correo, te enviamos un enlace');
  });
});

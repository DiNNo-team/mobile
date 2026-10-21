import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

import { env } from '@/config/env';

import { createAccountWithVerification, requestPasswordReset, resendVerificationEmail } from './account-actions';
import { getFirebaseAuth } from './firebase';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
jest.mock('./firebase', () => ({ getFirebaseAuth: jest.fn() }));
jest.mock('@/config/env', () => ({ env: { useMocks: false } }));

/** The mocked env is a plain object, so each test can switch example data on. */
const mockEnv = env as { useMocks: boolean };

const firebaseUser = { uid: 'u1' };
const auth = { currentUser: firebaseUser as typeof firebaseUser | null };
const firebaseError = (code: string) => Object.assign(new Error(code), { code });

beforeEach(() => {
  jest.clearAllMocks();
  auth.currentUser = firebaseUser;
  mockEnv.useMocks = false;
  jest.mocked(getFirebaseAuth).mockReturnValue(auth as unknown as ReturnType<typeof getFirebaseAuth>);
});

describe('createAccountWithVerification', () => {
  it('creates the account with the trimmed email and sends the verification email', async () => {
    jest.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: firebaseUser } as never);
    await createAccountWithVerification('  ana@correo.com ', 'clave-segura');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'ana@correo.com', 'clave-segura');
    expect(sendEmailVerification).toHaveBeenCalledWith(firebaseUser);
  });
});

describe('resendVerificationEmail', () => {
  it('sends the email to the current account', async () => {
    await expect(resendVerificationEmail()).resolves.toEqual({ ok: true });
    expect(sendEmailVerification).toHaveBeenCalledWith(firebaseUser);
  });

  it('too many requests and network errors get their texts', async () => {
    jest.mocked(sendEmailVerification).mockRejectedValueOnce(firebaseError('auth/too-many-requests'));
    await expect(resendVerificationEmail()).resolves.toEqual({
      ok: false,
      message: 'Hay demasiados intentos. Espera un momento e inténtalo de nuevo.',
    });
    jest.mocked(sendEmailVerification).mockRejectedValueOnce(firebaseError('auth/network-request-failed'));
    await expect(resendVerificationEmail()).resolves.toEqual({
      ok: false,
      message: 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.',
    });
  });

  it('without a Firebase account asks to sign in again', async () => {
    auth.currentUser = null;
    await expect(resendVerificationEmail()).resolves.toEqual({
      ok: false,
      message: 'Inicia sesión de nuevo para reenviar el correo.',
    });
    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it('with example data succeeds without Firebase', async () => {
    mockEnv.useMocks = true;
    await expect(resendVerificationEmail()).resolves.toEqual({ ok: true });
    expect(getFirebaseAuth).not.toHaveBeenCalled();
  });
});

describe('requestPasswordReset', () => {
  it('sends the link to the trimmed email', async () => {
    await expect(requestPasswordReset(' ana@correo.com ')).resolves.toEqual({ ok: true });
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'ana@correo.com');
  });

  it('an unknown email answers the same as a known one', async () => {
    jest.mocked(sendPasswordResetEmail).mockRejectedValueOnce(firebaseError('auth/user-not-found'));
    await expect(requestPasswordReset('nadie@correo.com')).resolves.toEqual({ ok: true });
  });

  it('other errors say what to do', async () => {
    jest.mocked(sendPasswordResetEmail).mockRejectedValueOnce(firebaseError('auth/internal-error'));
    await expect(requestPasswordReset('ana@correo.com')).resolves.toEqual({
      ok: false,
      message: 'No pudimos enviar el correo. Intenta de nuevo.',
    });
  });

  it('with example data succeeds without Firebase', async () => {
    mockEnv.useMocks = true;
    await expect(requestPasswordReset('ana@correo.com')).resolves.toEqual({ ok: true });
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

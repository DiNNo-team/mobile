import {
  getFirebaseActionErrorMessage,
  getFirebaseSignInErrorMessage,
  getFirebaseSignUpErrorMessage,
  INVALID_CREDENTIALS_MESSAGE,
} from './auth-errors';
import { validateEmail, validateNewPassword, validateSignInPassword } from './validation';

const firebase = (code: string) => ({ code });

describe('Firebase error texts (same as the web)', () => {
  it('never says whether the email or the password failed', () => {
    ['auth/invalid-credential', 'auth/invalid-login-credentials', 'auth/user-not-found', 'auth/wrong-password', 'auth/invalid-email'].forEach(
      (code) => expect(getFirebaseSignInErrorMessage(firebase(code))).toBe(INVALID_CREDENTIALS_MESSAGE),
    );
  });

  it('rate limit and network have their own text', () => {
    expect(getFirebaseSignInErrorMessage(firebase('auth/too-many-requests'))).toMatch(/demasiados intentos/);
    expect(getFirebaseSignInErrorMessage(firebase('auth/network-request-failed'))).toMatch(/conectarnos/);
  });

  it('unknown errors get a generic text, never the code', () => {
    const text = getFirebaseSignInErrorMessage(new Error('boom'));
    expect(text).toBe('No pudimos iniciar sesión. Revisa tu correo y contraseña e intenta de nuevo.');
    expect(getFirebaseActionErrorMessage(firebase('auth/whatever'), 'Otro')).toBe('Otro');
  });

  it('sign-up texts', () => {
    expect(getFirebaseSignUpErrorMessage(firebase('auth/email-already-in-use'))).toMatch(/Ya hay una cuenta/);
    expect(getFirebaseSignUpErrorMessage(firebase('auth/weak-password'))).toMatch(/8 caracteres/);
  });
});

describe('field validation', () => {
  it('email', () => {
    expect(validateEmail('')).toBe('Escribe tu correo.');
    expect(validateEmail('ana@')).toMatch(/correo válido/);
    expect(validateEmail('  ana@correo.com ')).toBeUndefined();
  });

  it('passwords', () => {
    expect(validateSignInPassword('')).toBe('Escribe tu contraseña.');
    expect(validateSignInPassword('x')).toBeUndefined();
    expect(validateNewPassword('1234567')).toMatch(/al menos 8/);
    expect(validateNewPassword('12345678')).toBeUndefined();
  });
});

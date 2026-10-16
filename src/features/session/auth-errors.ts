// Firebase Auth errors → interface texts. Same texts as the web (frontend/src/features/auth/auth-errors.ts),
// so both products say the same thing.

export const INVALID_CREDENTIALS_MESSAGE = 'Correo o contraseña incorrectos. Revisa e intenta de nuevo.';
const TOO_MANY_REQUESTS_MESSAGE = 'Hay demasiados intentos. Espera un momento e inténtalo de nuevo.';
const NETWORK_MESSAGE = 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.';

export function getFirebaseErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  return typeof error.code === 'string' ? error.code : undefined;
}

/** Generic Firebase action (verification email, reload…): rate limit and network, else `fallback`. */
export function getFirebaseActionErrorMessage(error: unknown, fallback: string): string {
  switch (getFirebaseErrorCode(error)) {
    case 'auth/too-many-requests':
      return TOO_MANY_REQUESTS_MESSAGE;
    case 'auth/network-request-failed':
      return NETWORK_MESSAGE;
    default:
      return fallback;
  }
}

/** Sign-in with email and password: never says whether the email or the password failed. */
export function getFirebaseSignInErrorMessage(error: unknown): string {
  switch (getFirebaseErrorCode(error)) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return INVALID_CREDENTIALS_MESSAGE;
    default:
      return getFirebaseActionErrorMessage(
        error,
        'No pudimos iniciar sesión. Revisa tu correo y contraseña e intenta de nuevo.',
      );
  }
}

/** Sign-up (Jacobo's screen). */
export function getFirebaseSignUpErrorMessage(error: unknown): string {
  switch (getFirebaseErrorCode(error)) {
    case 'auth/email-already-in-use':
      return 'Ya hay una cuenta con este correo. Inicia sesión o usa otro correo.';
    case 'auth/invalid-email':
      return 'Escribe un correo válido para crear tu cuenta.';
    case 'auth/weak-password':
      return 'Usa una contraseña más segura, de al menos 8 caracteres.';
    case 'auth/operation-not-allowed':
      return 'Por ahora no puedes crear cuentas desde aquí. Escríbele al equipo de DiNNo.';
    default:
      return getFirebaseActionErrorMessage(error, 'No pudimos crear tu cuenta. Intenta de nuevo.');
  }
}

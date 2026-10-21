import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

import { env } from '@/config/env';

import { GOOGLE_SIGN_IN_FAILED_MESSAGE } from './auth-errors';
import { onSignOut } from './SessionProvider';

// Native Google Sign-In (Original API of @react-native-google-signin/google-signin 16). It only gives the Google
// idToken: the screen hands it to Firebase with `signInWithFirebase` and the single flow does the rest.

export type GoogleTokenResult =
  | { kind: 'token'; idToken: string }
  /** The person closed the Google window: the screen shows nothing. */
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

/** Example diner of "Continuar con Google" with EXPO_PUBLIC_USE_MOCKS=true (Google is never called). */
export const MOCK_GOOGLE_EMAIL = 'google@dinno.test';

const NOT_CONFIGURED_MESSAGE = 'Por ahora no puedes continuar con Google. Inicia sesión con tu correo.';
const PLAY_SERVICES_MESSAGE = 'Actualiza Google Play Services en tu teléfono e intenta de nuevo.';

let configured = false;
/** A Google sign-out that failed: retried before the next Google sign-in, so the chooser always shows up. */
let signOutPending = false;

function configureOnce(): void {
  if (configured) return;
  GoogleSignin.configure({ webClientId: env.googleWebClientId ?? undefined });
  configured = true;
}

/** Forgets the Google account on the phone, so the next "Continuar con Google" asks which account to use. */
export async function signOutOfGoogle(): Promise<void> {
  if (env.useMocks) return;
  configureOnce();
  if (!signOutPending && !GoogleSignin.hasPreviousSignIn()) return;
  try {
    await GoogleSignin.signOut();
    signOutPending = false;
  } catch {
    signOutPending = true;
  }
}

onSignOut(() => {
  void signOutOfGoogle();
});

function describeGoogleError(error: unknown): GoogleTokenResult {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) return { kind: 'cancelled' };
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return { kind: 'error', message: PLAY_SERVICES_MESSAGE };
  }
  return { kind: 'error', message: GOOGLE_SIGN_IN_FAILED_MESSAGE };
}

/** Opens the Google account chooser and returns the idToken for Firebase. Never throws. */
export async function requestGoogleIdToken(): Promise<GoogleTokenResult> {
  if (!env.googleWebClientId) return { kind: 'error', message: NOT_CONFIGURED_MESSAGE };
  configureOnce();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    if (signOutPending) await signOutOfGoogle();
    // Version 16 answers a closed window with `cancelled` instead of throwing (the catch keeps the old code too).
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') return { kind: 'cancelled' };
    const { idToken } = response.data;
    return idToken ? { kind: 'token', idToken } : { kind: 'error', message: GOOGLE_SIGN_IN_FAILED_MESSAGE };
  } catch (error) {
    return describeGoogleError(error);
  }
}

import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';

import { env } from '@/config/env';

import { getFirebaseActionErrorMessage, getFirebaseErrorCode } from './auth-errors';
import { getFirebaseAuth } from './firebase';

// Firebase account actions of the sign-up, verification and password screens. Same behavior as the web
// (frontend/src/features/auth/AuthProvider.tsx). With EXPO_PUBLIC_USE_MOCKS=true there is no Firebase: they succeed.

export type ActionResult = { ok: true } | { ok: false; message: string };

/** Same text as the web: never says whether an account exists for that email. */
export const PASSWORD_RESET_SENT_MESSAGE =
  'Si hay una cuenta con ese correo, te enviamos un enlace para cambiar tu contraseña. Revisa tu bandeja de entrada.';

/** For `signInWithFirebase`: creates the account and sends the verification email. Throws Firebase errors. */
export async function createAccountWithVerification(email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  await sendEmailVerification(credential.user);
}

/** "Reenviar correo" on the verification screen. */
export async function resendVerificationEmail(): Promise<ActionResult> {
  if (env.useMocks) return { ok: true };
  const user = getFirebaseAuth().currentUser;
  if (!user) return { ok: false, message: 'Inicia sesión de nuevo para reenviar el correo.' };
  try {
    await sendEmailVerification(user);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getFirebaseActionErrorMessage(error, 'No pudimos reenviar el correo. Intenta de nuevo.') };
  }
}

/** "Recupera tu contraseña": an unknown email answers the same as a known one. */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  if (env.useMocks) return { ok: true };
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    return { ok: true };
  } catch (error) {
    if (getFirebaseErrorCode(error) === 'auth/user-not-found') return { ok: true };
    return { ok: false, message: getFirebaseActionErrorMessage(error, 'No pudimos enviar el correo. Intenta de nuevo.') };
  }
}

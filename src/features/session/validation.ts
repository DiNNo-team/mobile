// Field checks of the session forms (manual 10: say what to do, validate on blur and on submit).

import { DISPLAY_NAME_MAX_LENGTH } from './profile-flow';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Escribe tu correo.';
  if (!EMAIL_PATTERN.test(email)) return 'Escribe un correo válido, por ejemplo ana@correo.com.';
  return undefined;
}

/** Sign-in only checks that something was typed: Firebase decides if it is right. */
export function validateSignInPassword(value: string): string | undefined {
  return value ? undefined : 'Escribe tu contraseña.';
}

/** Sign-up name: 1 to 60 characters after trim, the range `POST /diners/me` accepts. */
export function validateDisplayName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Escribe tu nombre.';
  if (name.length > DISPLAY_NAME_MAX_LENGTH) return `Usa máximo ${DISPLAY_NAME_MAX_LENGTH} caracteres.`;
  return undefined;
}

/** Sign-up (Jacobo): at least 8 characters, like the web. */
export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Escribe una contraseña.';
  if (value.length < PASSWORD_MIN_LENGTH) return `Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  return undefined;
}

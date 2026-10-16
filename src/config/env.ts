// The only place that reads process.env. Expo inlines EXPO_PUBLIC_* only with static access
// (process.env.EXPO_PUBLIC_X), so each variable is read by its full name.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    'Falta EXPO_PUBLIC_API_URL. Copia .env.example a .env, define la URL del backend ' +
      '(en el emulador de Android, el backend local es http://10.0.2.2:3000) y reinicia con `npx expo start -c`.',
  );
}

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

function readFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !authDomain || !projectId) return null;
  return { apiKey, authDomain, projectId };
}

export const env = {
  /** Backend origin without the trailing "/". API paths carry the /v1 prefix (see lib/api). */
  apiUrl: apiUrl.replace(/\/+$/, ''),
  /** "true" answers every API call with the in-memory examples (contract shape of CLAUDE.md §10). */
  useMocks: process.env.EXPO_PUBLIC_USE_MOCKS === 'true',
  /** Local backend only: sends x-dev-user-id so you can test without Firebase. Ignored in release builds. */
  devUserId: __DEV__ ? (process.env.EXPO_PUBLIC_DEV_USER_ID ?? null) : null,
  /** Public Firebase web config (not secret). Null until the three variables are set. */
  firebase: readFirebaseConfig(),
} as const;

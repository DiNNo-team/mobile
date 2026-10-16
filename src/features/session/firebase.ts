import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

import { env } from '@/config/env';

let auth: Auth | null = null;

/**
 * Firebase Auth of the app (JS SDK, same project as the web). The session survives app restarts thanks to
 * AsyncStorage persistence. Jacobo: use this instance for Google Sign-In (`signInWithCredential`) and sign-up.
 */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  if (!env.firebase) {
    throw new Error(
      'Faltan EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN o EXPO_PUBLIC_FIREBASE_PROJECT_ID en .env ' +
        '(los mismos valores de la web). O usa EXPO_PUBLIC_USE_MOCKS=true para trabajar sin Firebase.',
    );
  }
  if (getApps().length > 0) {
    // Fast refresh re-runs this module: reuse the app and the auth already created.
    auth = getAuth(getApp());
    return auth;
  }
  const app = initializeApp(env.firebase);
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  return auth;
}

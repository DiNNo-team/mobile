import { useQueryClient } from '@tanstack/react-query';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { env } from '@/config/env';
import { accountApi } from '@/features/account/api';
import type { Me } from '@/features/account/types';
import { setAuthTokenProvider, subscribeToApiErrors } from '@/lib/api/client';
import { ErrorCode, errorMessages, getErrorMessage, isSessionExpired } from '@/lib/api/errors';

import { getFirebaseSignInErrorMessage } from './auth-errors';
import { getFirebaseAuth } from './firebase';
import { resolveDinerProfile, type ProfileResolution } from './profile-flow';
import { mockResolve, mockSignIn } from './session.mock';

/**
 * - `restoring`: reading the saved Firebase session (splash screen up).
 * - `resolving`: a restored session is checking its profile with the backend.
 * - `signed-out`, `email-not-verified`, `restaurant-account`, `unreachable` (backend not reachable), `ready` (diner).
 */
export type SessionStatus =
  | 'restoring'
  | 'resolving'
  | 'signed-out'
  | 'email-not-verified'
  | 'restaurant-account'
  | 'unreachable'
  | 'ready';

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export type SignInResult = { ok: true } | { ok: false; message: string };

export interface SignInOptions {
  /** Texts for the Firebase errors of this action (sign-up uses `getFirebaseSignUpErrorMessage`). */
  errorMessage?: (error: unknown) => string;
  /** Name for `POST /diners/me` when the account has none in Firebase (sign-up form). */
  displayName?: string;
}

export interface AuthContextValue {
  status: SessionStatus;
  /** The Firebase account of the session, or null. */
  user: SessionUser | null;
  /** The diner profile (`GET /me`) once `status` is `ready`. */
  profile: Me | null;
  /** One-time message for the login screen, e.g. "Tu sesión terminó. Inicia sesión de nuevo." */
  notice: string | null;
  /** Why the backend could not be reached (status `unreachable`), for `getErrorMessage`. */
  lastError: unknown;
  signInWithEmail: (email: string, password: string) => Promise<SignInResult>;
  /**
   * Runs any Firebase sign-in and then the single flow. Jacobo: Google is
   * `signInWithFirebase(() => signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken)))`
   * and sign-up passes `{ errorMessage: getFirebaseSignUpErrorMessage, displayName }`.
   */
  signInWithFirebase: (action: () => Promise<unknown>, options?: SignInOptions) => Promise<SignInResult>;
  /** Runs the single flow again (retry after `unreachable`). */
  refreshProfile: () => Promise<void>;
  /** "Ya lo verifiqué": reloads the account and, if verified, continues the flow. Returns whether it is verified. */
  reloadEmailVerification: () => Promise<boolean>;
  /** Signs out of Firebase and clears the cache, the search filters and the socket. */
  signOut: () => Promise<void>;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const signOutCleanups = new Set<() => void>();

/** Features register what must be forgotten on sign-out (search filters, socket…). Returns the unregister. */
export function onSignOut(cleanup: () => void): () => void {
  signOutCleanups.add(cleanup);
  return () => signOutCleanups.delete(cleanup);
}

function toSessionUser(user: FirebaseUser): SessionUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified };
}

const MOCK_UID = 'mock-diner';

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>(env.useMocks ? 'signed-out' : 'restoring');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<Me | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);
  /** True while a sign-in started from a screen runs: the auth listener leaves it alone. */
  const interactive = useRef(false);
  /** True while the single flow talks to the backend: its own 401/403 answers are not session events. */
  const flowRunning = useRef(false);
  /** Latest values for the long-lived listeners (Firebase and API errors), updated after each render. */
  const latest = useRef({ status, clearSession: () => {}, resolveInBackground: async (_name?: string) => {} });

  const clearSession = useCallback(() => {
    queryClient.clear();
    signOutCleanups.forEach((cleanup) => cleanup());
    setUser(null);
    setProfile(null);
    setLastError(null);
    setStatus('signed-out');
  }, [queryClient]);

  const signOut = useCallback(async () => {
    interactive.current = false;
    if (!env.useMocks) await firebaseSignOut(getFirebaseAuth());
    clearSession();
  }, [clearSession]);

  const expireSession = useCallback(async () => {
    await signOut();
    setNotice(errorMessages.sessionExpired);
  }, [signOut]);

  const runFlow = useCallback(async (displayName?: string): Promise<ProfileResolution> => {
    flowRunning.current = true;
    try {
      if (env.useMocks) return await mockResolve(user?.email ?? 'comensal@dinno.test');
      return await resolveDinerProfile(accountApi, displayName);
    } finally {
      flowRunning.current = false;
    }
  }, [user?.email]);

  /** Moves the session to where the flow landed. `session-expired` and `unreachable` are handled by the caller. */
  const applyResolution = useCallback((resolution: ProfileResolution) => {
    switch (resolution.kind) {
      case 'diner':
        setProfile(resolution.profile);
        setStatus('ready');
        break;
      case 'restaurant-account':
        setProfile(null);
        setStatus('restaurant-account');
        break;
      case 'email-not-verified':
        setProfile(null);
        setStatus('email-not-verified');
        break;
      case 'unreachable':
        setLastError(resolution.error);
        setStatus('unreachable');
        break;
      case 'session-expired':
        break;
    }
  }, []);

  /** Restored session or Firebase change outside a screen: flow with the full-screen "Conectando con DiNNo…". */
  const resolveInBackground = useCallback(
    async (displayName?: string) => {
      setStatus('resolving');
      const resolution = await runFlow(displayName);
      if (resolution.kind === 'session-expired') await expireSession();
      else applyResolution(resolution);
    },
    [runFlow, expireSession, applyResolution],
  );

  useEffect(() => {
    latest.current = { status, clearSession, resolveInBackground };
  });

  useEffect(() => {
    if (env.useMocks) {
      setAuthTokenProvider(null);
      return;
    }
    const auth = getFirebaseAuth();
    setAuthTokenProvider(async () => (auth.currentUser ? auth.currentUser.getIdToken() : null));
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (interactive.current) return;
      if (!firebaseUser) {
        latest.current.clearSession();
        return;
      }
      setUser(toSessionUser(firebaseUser));
      void latest.current.resolveInBackground(firebaseUser.displayName ?? undefined);
    });
    return () => {
      unsubscribe();
      setAuthTokenProvider(null);
    };
  }, []);

  useEffect(
    () =>
      subscribeToApiErrors((error) => {
        if (flowRunning.current || latest.current.status !== 'ready') return;
        if (isSessionExpired(error)) void expireSession();
        else if (error.errorCode === ErrorCode.RestaurantAccount) setStatus('restaurant-account');
        else if (error.errorCode === ErrorCode.EmailNotVerified) setStatus('email-not-verified');
        else if (error.errorCode === ErrorCode.ProfileRequired) void latest.current.resolveInBackground();
      }),
    [expireSession],
  );

  const signInWithFirebase = useCallback(
    async (action: () => Promise<unknown>, options: SignInOptions = {}): Promise<SignInResult> => {
      const describe = options.errorMessage ?? getFirebaseSignInErrorMessage;
      interactive.current = true;
      setNotice(null);
      try {
        await action();
      } catch (error) {
        interactive.current = false;
        return { ok: false, message: describe(error) };
      }
      const firebaseUser = getFirebaseAuth().currentUser;
      if (!firebaseUser) {
        interactive.current = false;
        return { ok: false, message: describe(null) };
      }
      setUser(toSessionUser(firebaseUser));
      const resolution = await runFlow(options.displayName ?? firebaseUser.displayName ?? undefined);
      interactive.current = false;
      if (resolution.kind === 'session-expired' || resolution.kind === 'unreachable') {
        // From a form, a backend problem stays on the form: no half-open session behind it.
        await signOut();
        return {
          ok: false,
          message: resolution.kind === 'unreachable' ? getErrorMessage(resolution.error) : errorMessages.sessionExpired,
        };
      }
      applyResolution(resolution);
      return { ok: true };
    },
    [runFlow, signOut, applyResolution],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      if (!env.useMocks) {
        return signInWithFirebase(() => signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password));
      }
      setNotice(null);
      try {
        const resolution = await mockSignIn(email, password);
        if (resolution.kind === 'unreachable') return { ok: false, message: getErrorMessage(resolution.error) };
        setUser({ uid: MOCK_UID, email: email.trim().toLowerCase(), displayName: null, emailVerified: true });
        applyResolution(resolution);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getFirebaseSignInErrorMessage(error) };
      }
    },
    [signInWithFirebase, applyResolution],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await resolveInBackground(user.displayName ?? undefined);
  }, [user, resolveInBackground]);

  const reloadEmailVerification = useCallback(async (): Promise<boolean> => {
    if (env.useMocks) {
      applyResolution(await mockResolve(user?.email ?? 'comensal@dinno.test'));
      return true;
    }
    const firebaseUser = getFirebaseAuth().currentUser;
    if (!firebaseUser) return false;
    await firebaseUser.reload();
    // A fresh token carries email_verified = true for the backend.
    await firebaseUser.getIdToken(true);
    setUser(toSessionUser(firebaseUser));
    if (firebaseUser.emailVerified) await resolveInBackground(firebaseUser.displayName ?? undefined);
    return firebaseUser.emailVerified;
  }, [user?.email, applyResolution, resolveInBackground]);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      notice,
      lastError,
      signInWithEmail,
      signInWithFirebase,
      refreshProfile,
      reloadEmailVerification,
      signOut,
      clearNotice,
    }),
    [status, user, profile, notice, lastError, signInWithEmail, signInWithFirebase, refreshProfile, reloadEmailVerification, signOut, clearNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside SessionProvider');
  return context;
}

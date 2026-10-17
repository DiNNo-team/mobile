import type { Me } from '@/features/account/types';

import type { ProfileResolution } from './profile-flow';

const MOCK_LATENCY_MS = 600;

/** Example accounts for EXPO_PUBLIC_USE_MOCKS=true. Any other email with any password signs in as a diner. */
export const MOCK_ACCOUNTS = {
  restaurant: 'restaurante@dinno.test',
  unverified: 'sinverificar@dinno.test',
  unreachable: 'sinconexion@dinno.test',
  /** This password always fails, to see the invalid credentials message. */
  wrongPassword: 'incorrecta',
} as const;

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

/** Firebase-like error, so the screens map it with the same functions. */
function firebaseError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code });
}

function mockDiner(email: string): Me {
  return {
    id: '9b7e4c22-0000-4f00-8a00-00000000d1e7',
    email,
    displayName: email.split('@')[0] ?? null,
    role: 'diner',
    restaurantId: null,
  };
}

/** Mock of "Firebase sign-in + single flow". Throws like Firebase for bad credentials. */
export async function mockSignIn(email: string, password: string): Promise<ProfileResolution> {
  await wait();
  const normalized = email.trim().toLowerCase();
  if (password === MOCK_ACCOUNTS.wrongPassword) throw firebaseError('auth/invalid-credential');
  if (normalized === MOCK_ACCOUNTS.restaurant) return { kind: 'restaurant-account' };
  if (normalized === MOCK_ACCOUNTS.unverified) return { kind: 'email-not-verified' };
  if (normalized === MOCK_ACCOUNTS.unreachable) return { kind: 'unreachable', error: new Error('mock unreachable') };
  return { kind: 'diner', profile: mockDiner(normalized) };
}

export async function mockResolve(email: string): Promise<ProfileResolution> {
  await wait();
  return { kind: 'diner', profile: mockDiner(email) };
}

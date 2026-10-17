import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { ApiError } from './api/errors';

const MAX_RETRIES = 2;

/** 4xx answers will not change by retrying; network errors, timeouts and 5xx get two more tries. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.kind === 'http' && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    // `always`: without internet a request fails and the screen shows "No pudimos conectarnos…" + retry,
    // instead of waiting in silence. The online manager below still refetches when the connection returns.
    queries: { retry: shouldRetry, staleTime: 30_000, networkMode: 'always' },
    mutations: { retry: false, networkMode: 'always' },
  },
});

/**
 * React Native has no window focus or online events: the app's foreground and the phone's network play that
 * role (Reparto 2.4: refetch on returning to the app and on reconnecting; the 60 s refetch pauses in the
 * background).
 */
export function connectQueryLifecycle(): () => void {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (state) => setFocused(state === 'active'));
    return () => subscription.remove();
  });
  onlineManager.setEventListener((setOnline) =>
    // `isConnected` is null while unknown: treated as online so nothing waits for it.
    NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
  );
  return () => {
    focusManager.setEventListener(() => undefined);
    onlineManager.setEventListener(() => undefined);
  };
}

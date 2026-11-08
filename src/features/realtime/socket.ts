import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';
import { getAuthToken } from '@/lib/api/client';

import { getRetryDelay } from './availability-cache';

const SERVER_ERROR = 'SERVER_ERROR';

// One Socket.IO connection per diner session (CLAUDE.md §10 and §12.7), shared by every live feature: availability
// (`availability.changed`, room `diners`) and the diner's reservations (`reservation.*`, room `diner:{userId}`). The
// server assigns the rooms on connect. Features never open their own socket: they read this one with
// `useDinerSocket()` and add their listeners.

let socket: Socket | null = null;
const listeners = new Set<() => void>();

function publish(next: Socket | null) {
  socket = next;
  for (const listener of listeners) listener();
}

function start(): () => void {
  const created = io(env.apiUrl, {
    transports: ['websocket'],
    autoConnect: false,
    // A function, so every reconnection sends a valid token (a fixed object would reuse an expired one).
    auth: (send) => {
      getAuthToken()
        .then((token) => send({ token }))
        .catch(() => send({}));
    },
  });

  let retryAttempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  const clearRetry = () => {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = undefined;
  };

  created.on('connect', () => {
    retryAttempt = 0;
  });

  // Network problems: Socket.IO retries by itself (`socket.active`). A rejected handshake is final; only SERVER_ERROR
  // deserves new tries. Session codes are handled by the session flow over HTTP.
  created.on('connect_error', (error) => {
    if (created.active || error.message !== SERVER_ERROR) return;
    clearRetry();
    retryTimer = setTimeout(() => created.connect(), getRetryDelay(retryAttempt));
    retryAttempt += 1;
  });

  // In the background the socket closes (battery, and Android would cut it anyway); back in the foreground it connects
  // again, and each feature asks its data again on that reconnection (`onReconnect`).
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      if (!created.connected) created.connect();
    } else if (state === 'background') {
      clearRetry();
      created.disconnect();
    }
  });

  publish(created);
  created.connect();

  return () => {
    appState.remove();
    clearRetry();
    created.removeAllListeners();
    created.disconnect();
    publish(null);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Owns the session's socket: mount it once, where the diner session lives (`(app)/_layout.tsx`). Leaving (sign-out)
 * closes it. With the example data there is no backend, so pass `false`.
 */
export function useDinerSocketConnection(enabled: boolean) {
  useEffect(() => (enabled ? start() : undefined), [enabled]);
}

/** The session's socket, or null while there is none. Add listeners in an effect and remove them on cleanup. */
export function useDinerSocket(): Socket | null {
  return useSyncExternalStore(subscribe, () => socket);
}

/**
 * Calls `handler` on every connection after the first one this subscriber saw: back from a cut or from the background,
 * whatever changed meanwhile must be asked again. Returns the unsubscribe.
 */
export function onReconnect(target: Socket, handler: () => void): () => void {
  let seen = target.connected;
  const listener = () => {
    if (seen) handler();
    seen = true;
  };
  target.on('connect', listener);
  return () => {
    target.off('connect', listener);
  };
}

import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';

import { env } from '@/config/env';
import { searchKeys } from '@/features/search/queries';
import type { RestaurantDetail, RestaurantSummary } from '@/features/search/types';
import { getAuthToken } from '@/lib/api/client';

import {
  applyToDetail,
  applyToResults,
  AVAILABILITY_CHANGED,
  getRetryDelay,
  isAvailabilityChangedEvent,
  type AvailabilityChangedEvent,
} from './availability-cache';

/** Several changes in a row (a restaurant updating many tables) end in one refetch. */
const REFETCH_DEBOUNCE_MS = 1_500;
const SERVER_ERROR = 'SERVER_ERROR';

/** Refetch of the searches and details on screen (inactive ones are only marked stale). */
function refetchLive(queryClient: QueryClient, restaurantIds?: Iterable<string>) {
  queryClient.invalidateQueries({ queryKey: searchKeys.allRestaurants() });
  if (!restaurantIds) {
    queryClient.invalidateQueries({ queryKey: ['restaurant'] });
    return;
  }
  for (const id of restaurantIds) queryClient.invalidateQueries({ queryKey: searchKeys.restaurant(id) });
}

/** The event in the cache right away: list, map and detail change without waiting for the server. */
function applyEvent(queryClient: QueryClient, event: AvailabilityChangedEvent) {
  queryClient.setQueriesData<RestaurantSummary[]>({ queryKey: searchKeys.allRestaurants() }, (results) =>
    applyToResults(results, event),
  );
  queryClient.setQueriesData<RestaurantDetail>({ queryKey: searchKeys.restaurant(event.restaurantId) }, (detail) =>
    applyToDetail(detail, event),
  );
}

/**
 * Live availability (Reparto 2.4 and 9, CLAUDE.md §10 "Tiempo real"): Socket.IO with a fresh token on every
 * connection. Each `availability.changed` updates the cache at once and, after a short pause, the searches
 * and details on screen are asked again (the event has no coordinates or capacities: a restaurant that opens
 * comes back and the people filter stays right). If the socket falls, nothing is shown: the 60 s refetch goes on.
 * Mounted only while there is a diner session; leaving it (sign out) closes the socket.
 */
export function useAvailabilityRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const socket = io(env.apiUrl, {
      transports: ['websocket'],
      autoConnect: false,
      // A function, so every reconnection sends a valid token (a fixed object would reuse an expired one).
      auth: (send) => {
        getAuthToken()
          .then((token) => send({ token }))
          .catch(() => send({}));
      },
    });

    let connectedBefore = false;
    let retryAttempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let refetchTimer: ReturnType<typeof setTimeout> | undefined;
    const changedIds = new Set<string>();

    const clearRetry = () => {
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = undefined;
    };

    socket.on(AVAILABILITY_CHANGED, (payload: unknown) => {
      if (!isAvailabilityChangedEvent(payload)) return;
      applyEvent(queryClient, payload);
      changedIds.add(payload.restaurantId);
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(() => {
        refetchLive(queryClient, changedIds);
        changedIds.clear();
      }, REFETCH_DEBOUNCE_MS);
    });

    socket.on('connect', () => {
      retryAttempt = 0;
      // Back after a cut: whatever changed meanwhile arrives with a refetch.
      if (connectedBefore) refetchLive(queryClient);
      connectedBefore = true;
    });

    // Network problems: Socket.IO retries by itself (`socket.active`). A rejected handshake is final; only
    // SERVER_ERROR deserves new tries. Session codes are handled by the session flow over HTTP.
    socket.on('connect_error', (error) => {
      if (socket.active || error.message !== SERVER_ERROR) return;
      clearRetry();
      retryTimer = setTimeout(() => socket.connect(), getRetryDelay(retryAttempt));
      retryAttempt += 1;
    });

    // In the background the socket closes (battery, and Android would cut it anyway); back in the foreground
    // it connects again and the 'connect' handler refetches.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (!socket.connected) socket.connect();
      } else if (state === 'background') {
        clearRetry();
        socket.disconnect();
      }
    });

    socket.connect();

    return () => {
      appState.remove();
      clearRetry();
      if (refetchTimer) clearTimeout(refetchTimer);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}

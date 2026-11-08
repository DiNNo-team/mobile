import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { searchKeys } from '@/features/search/queries';
import type { RestaurantDetail, RestaurantSummary } from '@/features/search/types';

import { applyToDetail, applyToResults, AVAILABILITY_CHANGED, isAvailabilityChangedEvent, type AvailabilityChangedEvent } from './availability-cache';
import { onReconnect, useDinerSocket } from './socket';

/** Several changes in a row (a restaurant updating many tables) end in one refetch. */
const REFETCH_DEBOUNCE_MS = 1_500;

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
 * Live availability (Reparto 2.4 and 9, CLAUDE.md §10 "Tiempo real") on the session's shared socket
 * (`features/realtime/socket.ts`). Each `availability.changed` updates the cache at once and, after a short pause, the
 * searches and details on screen are asked again (the event has no coordinates or capacities: a restaurant that opens
 * comes back and the people filter stays right). Back after a cut, everything on screen is asked again. If the socket
 * falls, nothing is shown: the 60 s refetch goes on.
 */
export function useAvailabilityRealtime() {
  const queryClient = useQueryClient();
  const socket = useDinerSocket();

  useEffect(() => {
    if (!socket) return;
    let refetchTimer: ReturnType<typeof setTimeout> | undefined;
    const changedIds = new Set<string>();

    const onChanged = (payload: unknown) => {
      if (!isAvailabilityChangedEvent(payload)) return;
      applyEvent(queryClient, payload);
      changedIds.add(payload.restaurantId);
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(() => {
        refetchLive(queryClient, changedIds);
        changedIds.clear();
      }, REFETCH_DEBOUNCE_MS);
    };
    socket.on(AVAILABILITY_CHANGED, onChanged);
    const offReconnect = onReconnect(socket, () => refetchLive(queryClient));

    return () => {
      socket.off(AVAILABILITY_CHANGED, onChanged);
      offReconnect();
      if (refetchTimer) clearTimeout(refetchTimer);
    };
  }, [socket, queryClient]);
}

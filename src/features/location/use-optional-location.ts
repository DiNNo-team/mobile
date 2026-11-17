import { useEffect, useRef, useState } from 'react';

import type { Coordinates } from '@/features/search/types';

import { getLocationPermission, locateDevice } from './location';

/**
 * The phone's position for Explorar (Sprint 4): optional. On the first open it asks the permission once (the system
 * dialog explains why, with the Info.plist / manifest text) and, when granted, reads the position. Without it the
 * map still shows every restaurant, only without distances, so a failure needs no message.
 */
export function useOptionalLocation({ known, onLocated }: { known: boolean; onLocated: (coordinates: Coordinates) => void }) {
  // Read once: the position is looked up only when Explorar first opens without one.
  const [lookUp] = useState(!known);
  const [locating, setLocating] = useState(lookUp);
  const latest = useRef(onLocated);

  useEffect(() => {
    latest.current = onLocated;
  });

  useEffect(() => {
    if (!lookUp) return;
    let active = true;
    getLocationPermission()
      .then((permission) => (permission === 'blocked' ? null : locateDevice({ ask: permission === 'ask' })))
      .then((result) => {
        if (active && result?.ok) latest.current(result.coordinates);
      })
      // Without the position the map still shows every restaurant: nothing to tell the diner.
      .catch(() => undefined)
      .finally(() => {
        if (active) setLocating(false);
      });
    return () => {
      active = false;
    };
  }, [lookUp]);

  return { locating };
}

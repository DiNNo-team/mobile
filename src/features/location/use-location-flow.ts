import { useCallback, useEffect, useRef, useState } from 'react';

import { getLocationPermission, locateDevice, type LocationFailure } from './location';
import type { Coordinates } from '@/features/search/types';

/**
 * - `checking`: reading the permission the first time Explore opens (nothing asked yet).
 * - `explain`: the screen explains why before the system dialog (Reparto: explanation → permission).
 * - `locating`: waiting for the position (at most 10 s).
 * - `idle`: nothing running; `failure` says why the last attempt did not work, if it did not.
 */
export type LocationStep = 'checking' | 'explain' | 'locating' | 'idle';

interface LocationFlowOptions {
  /** True when the search already has an origin: Explore opens straight to the results. */
  hasOrigin: boolean;
  onLocated: (coordinates: Coordinates) => void;
  /** The position could not be used: the screen moves on to the zones. */
  onFailed: (failure: LocationFailure) => void;
}

export function useLocationFlow({ hasOrigin, onLocated, onFailed }: LocationFlowOptions) {
  // Read once: later changes of origin come from the diner, not from the first check.
  const [checkOnOpen] = useState(!hasOrigin);
  const [step, setStep] = useState<LocationStep>(checkOnOpen ? 'checking' : 'idle');
  const [failure, setFailure] = useState<LocationFailure | null>(null);
  // Each attempt gets a number; choosing a zone meanwhile makes the late answer of the GPS be ignored.
  const attempt = useRef(0);
  const latest = useRef({ hasOrigin, onLocated, onFailed });

  useEffect(() => {
    latest.current = { hasOrigin, onLocated, onFailed };
  });

  const finish = useCallback((result: Awaited<ReturnType<typeof locateDevice>>, id: number) => {
    if (id !== attempt.current) return;
    // The origin is set before leaving `locating`, so the screen never sees "no origin and not locating".
    if (result.ok) {
      latest.current.onLocated(result.coordinates);
      setFailure(null);
    } else {
      setFailure(result.failure);
      latest.current.onFailed(result.failure);
    }
    setStep('idle');
  }, []);

  /** "Usar mi ubicación": asks the permission if needed and reads the position. */
  const locate = useCallback(async () => {
    const id = ++attempt.current;
    setStep('locating');
    finish(await locateDevice({ ask: true }), id);
  }, [finish]);

  /** The diner chose a zone (or closed the explanation): stop waiting for the GPS. */
  const cancel = useCallback(() => {
    attempt.current += 1;
    setStep('idle');
    setFailure(null);
  }, []);

  // First open without an origin: with the permission already granted, locate right away; if it can be
  // asked, explain first; if it is blocked, go to the zones. Never replaces an origin the diner chose
  // (the effect also runs again on a Fast Refresh in development).
  useEffect(() => {
    if (!checkOnOpen || latest.current.hasOrigin) return;
    const id = ++attempt.current;
    let active = true;
    getLocationPermission()
      .then(async (permission) => {
        if (!active || id !== attempt.current || latest.current.hasOrigin) return;
        if (permission === 'ask') return setStep('explain');
        if (permission === 'granted') setStep('locating');
        finish(await locateDevice({ ask: false }), id);
      })
      .catch(() => finish({ ok: false, failure: 'unavailable' }, id));
    return () => {
      active = false;
    };
  }, [checkOnOpen, finish]);

  return { step, failure, locate, cancel };
}

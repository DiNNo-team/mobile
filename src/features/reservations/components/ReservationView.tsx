import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { Linking, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import {
  Button,
  CodeCells,
  CountdownRing,
  RESERVATION_STATUS_PRESENTATION,
  StatusChip,
  Text,
  Ticket,
  TicketDivider,
  useToast,
} from '@/components/ui';
import { getDirectionsUrl } from '@/features/search/filters';
import { ADDRESS_FALLBACK } from '@/features/search/types';
import { formatPeople, formatTableName } from '@/lib/format/table';
import { motion } from '@/theme/tokens';

import { completedText, RESERVATION_TEXT, spokenCode } from '../messages';
import type { TimedReservation } from '../queries';
import { formatCountdown, remainingMs, spokenCountdown } from '../timer';

import { ReservationQr } from './ReservationQr';

function goExplore() {
  router.replace('/');
}

/** «● Activa» on its green tint; the dot beats (a ring grows and fades every 1.6 s), still with reduced motion. */
function ActiveBadge() {
  const reduceMotion = useReducedMotion();
  const beat = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    beat.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.bezier(...motion.enter) }), -1, false);
    return () => cancelAnimation(beat);
  }, [reduceMotion, beat]);

  const ring = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - beat.value), transform: [{ scale: 1 + 0.9 * beat.value }] }));

  return (
    <View accessible accessibilityLabel="Activa" className="h-[30px] flex-row items-center gap-2 self-start rounded-chip bg-tint-ok pl-[11px] pr-[13px]">
      <View className="h-2 w-2 items-center justify-center">
        {reduceMotion ? null : <Animated.View className="absolute h-2 w-2 rounded-chip bg-ok" style={ring} />}
        <View className="h-2 w-2 rounded-chip bg-ok" />
      </View>
      <Text variant="small">Activa</Text>
    </View>
  );
}

/** The circular timer: what is left of the reservation's whole time, from the server clock. */
function Countdown({ reservation, now }: { reservation: TimedReservation; now: number }) {
  const left = remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, now);
  const total = Date.parse(reservation.expiresAt) - Date.parse(reservation.createdAt);
  const progress = total > 0 ? left / total : 0;

  return (
    <CountdownRing progress={progress} accessibilityLabel={left === 0 ? RESERVATION_TEXT.verifying : `Quedan ${spokenCountdown(left)}`}>
      {left === 0 ? (
        <Text variant="section" accessibilityLiveRegion="polite" className="text-center">
          {RESERVATION_TEXT.verifying}
        </Text>
      ) : (
        <>
          <Text variant="small" tone="caption">
            Quedan
          </Text>
          <Text variant="timer">{formatCountdown(left)}</Text>
        </>
      )}
    </CountdownRing>
  );
}

function FinalState({ reservation }: { reservation: TimedReservation }) {
  const message =
    reservation.status === 'completed'
      ? completedText(reservation.restaurant.name)
      : reservation.status === 'expired'
        ? RESERVATION_TEXT.expired
        : RESERVATION_TEXT.cancelled;
  return (
    <View className="gap-6">
      <Ticket className="items-center gap-3 px-[22px] py-6">
        <StatusChip status={RESERVATION_STATUS_PRESENTATION[reservation.status as 'completed' | 'expired' | 'cancelled']} />
        <Text variant="name" className="text-center">
          {reservation.restaurant.name}
        </Text>
        <Text variant="lead" accessibilityRole="header" className="text-center">
          {message}
        </Text>
      </Ticket>
      {reservation.status === 'completed' ? null : (
        <Button shape="pill" size="lg" label={RESERVATION_TEXT.searchAnother} fullWidth onPress={goExplore} />
      )}
    </View>
  );
}

export interface ReservationViewProps {
  reservation: TimedReservation;
  /** Monotonic now, ticking every second (`useMonotonicNow`). */
  now: number;
  /** Extra actions under «Cómo llegar» while active (cancel). */
  activeActions?: ReactNode;
}

/**
 * The diner's reservation as a ticket (Tasks 2.1.3 and 2.1.4, reparto 9.2; mobile v3 «Tu reserva»): on top «Activa», the
 * table and people, the restaurant and the circular timer from the server clock; below the tear, the QR and the code.
 * In any other state the code is gone (the API sends `null`) and the final message shows: Vencida · Cancelada · Cumplida.
 */
export function ReservationView({ reservation, now, activeActions }: ReservationViewProps) {
  const { showToast } = useToast();
  if (reservation.status !== 'active' || !reservation.code) return <FinalState reservation={reservation} />;
  const code = reservation.code;

  const openDirections = async () => {
    try {
      await Linking.openURL(getDirectionsUrl(reservation.restaurant));
    } catch {
      showToast({ type: 'error', message: 'No pudimos abrir Google Maps. Intenta de nuevo.' });
    }
  };

  return (
    <View>
      <Ticket>
        <View className="px-[22px] pb-4 pt-5">
          <View className="flex-row items-center justify-between gap-3">
            <ActiveBadge />
            <Text variant="small" numberOfLines={1} className="shrink">
              {formatTableName(reservation.table.identifier)} · {formatPeople(reservation.partySize)}
            </Text>
          </View>
          <Text variant="name" className="mt-3.5">
            {reservation.restaurant.name}
          </Text>
          <Text variant="sec" tone="secondary" className="mt-0.5">
            {reservation.restaurant.address ?? ADDRESS_FALLBACK}
          </Text>
          <View className="mt-3.5">
            <Countdown reservation={reservation} now={now} />
          </View>
        </View>

        <TicketDivider />

        <View className="gap-3 px-[22px] pb-5 pt-3">
          <View className="flex-row items-center gap-3.5">
            <ReservationQr code={code} />
            <View className="min-w-0 flex-1 gap-2">
              <Text variant="strong" tone="secondary">
                {RESERVATION_TEXT.codeLabel}
              </Text>
              <CodeCells code={code} accessibilityLabel={`${RESERVATION_TEXT.codeLabel}: ${spokenCode(code)}`} />
            </View>
          </View>
          <Text variant="sec" tone="secondary" className="text-center">
            {RESERVATION_TEXT.codeHint}
          </Text>
        </View>
      </Ticket>

      <View className="mt-5 gap-1">
        <Button
          variant="raised"
          shape="pill"
          size="lg"
          label={RESERVATION_TEXT.directions}
          trailingIcon={ArrowRight}
          fullWidth
          onPress={openDirections}
        />
        {activeActions}
      </View>
    </View>
  );
}

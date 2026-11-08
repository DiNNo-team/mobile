import { router } from 'expo-router';
import { ArrowRight, MapIcon, Users } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Linking, View } from 'react-native';

import { Button, Card, Icon, RESERVATION_STATUS_PRESENTATION, StatusChip, Text, useToast } from '@/components/ui';
import { getDirectionsUrl } from '@/features/search/filters';
import { ADDRESS_FALLBACK } from '@/features/search/types';
import { formatPeople, formatTableName } from '@/lib/format/table';

import { completedText, RESERVATION_TEXT, spokenCode } from '../messages';
import type { TimedReservation } from '../queries';
import { formatCountdown, remainingMs, spokenCountdown } from '../timer';

function goExplore() {
  router.replace('/');
}

/** The code, big and easy to read when shown to the restaurant: one tabular figure per character, never cut. */
function ReservationCode({ code }: { code: string }) {
  return (
    <View className="items-center gap-2" accessible accessibilityLabel={`${RESERVATION_TEXT.codeLabel}: ${spokenCode(code)}`}>
      <Text variant="kicker" tone="secondary">
        {RESERVATION_TEXT.codeLabel}
      </Text>
      <View className="flex-row gap-2">
        {code.split('').map((char, index) => (
          <Text key={index} variant="figure" tabular>
            {char}
          </Text>
        ))}
      </View>
      <Text variant="sec" tone="secondary" className="text-center">
        {RESERVATION_TEXT.codeHint}
      </Text>
    </View>
  );
}

function Countdown({ reservation, now }: { reservation: TimedReservation; now: number }) {
  const left = remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, now);
  if (left === 0) {
    return (
      <Text variant="h2" accessibilityLiveRegion="polite" className="text-center">
        {RESERVATION_TEXT.verifying}
      </Text>
    );
  }
  return (
    <Text variant="display" tabular className="text-center" accessibilityLabel={`Quedan ${spokenCountdown(left)}`}>
      {formatCountdown(left)}
    </Text>
  );
}

function Details({ reservation }: { reservation: TimedReservation }) {
  const { showToast } = useToast();
  const openDirections = async () => {
    try {
      await Linking.openURL(getDirectionsUrl(reservation.restaurant));
    } catch {
      showToast({ type: 'error', message: 'No pudimos abrir Google Maps. Intenta de nuevo.' });
    }
  };
  return (
    <Card>
      <View className="gap-3">
        <Text variant="h3">{reservation.restaurant.name}</Text>
        <View className="flex-row items-start gap-2">
          <Icon icon={MapIcon} size={16} color="text2" />
          <Text variant="body" className="flex-1">
            {reservation.restaurant.address ?? ADDRESS_FALLBACK}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon icon={Users} size={16} color="text2" />
          <Text variant="body">
            {formatTableName(reservation.table.identifier)} · {formatPeople(reservation.partySize)}
          </Text>
        </View>
        <Button variant="secondary" icon={ArrowRight} label={RESERVATION_TEXT.directions} fullWidth onPress={openDirections} />
      </View>
    </Card>
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
      <View className="items-center gap-3">
        <StatusChip status={RESERVATION_STATUS_PRESENTATION[reservation.status as 'completed' | 'expired' | 'cancelled']} />
        <Text variant="h2" accessibilityRole="header" className="text-center">
          {message}
        </Text>
      </View>
      {reservation.status === 'completed' ? null : <Button label={RESERVATION_TEXT.searchAnother} fullWidth onPress={goExplore} />}
    </View>
  );
}

export interface ReservationViewProps {
  reservation: TimedReservation;
  /** Monotonic now, ticking every second (`useMonotonicNow`). */
  now: number;
  /** Extra actions under the details while active (cancel, Phase 6). */
  activeActions?: ReactNode;
}

/**
 * The diner's reservation (Tasks 2.1.3 and 2.1.4, reparto 9.2): while active, the big code, the countdown from the
 * server clock, the restaurant, table and people, and «Cómo llegar». In any other state the code is gone (the API sends
 * `null`) and the final message shows: Vencida · Cancelada · Cumplida.
 */
export function ReservationView({ reservation, now, activeActions }: ReservationViewProps) {
  if (reservation.status !== 'active' || !reservation.code) return <FinalState reservation={reservation} />;
  return (
    <View className="gap-6">
      <View className="items-center gap-4">
        <StatusChip status={RESERVATION_STATUS_PRESENTATION.active} />
        <Countdown reservation={reservation} now={now} />
        <ReservationCode code={reservation.code} />
      </View>
      <Details reservation={reservation} />
      {activeActions}
    </View>
  );
}

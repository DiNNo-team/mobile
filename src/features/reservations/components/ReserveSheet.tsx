import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Timer } from 'lucide-react-native';

import { Alert, BottomSheet, Button, GlassCard, Icon, NumberStepper, RETRY_LABEL, Text, useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api/errors';
import { primaryTapHaptic } from '@/lib/haptics';
import { formatPeople } from '@/lib/format/table';

import { createErrorView, RESERVATION_TEXT, validityMinutes, validityText, type CreateErrorView } from '../messages';
import { useCreateReservation, useOpenActiveReservation } from '../queries';
import { PARTY_SIZE_LIMITS } from '../types';

/** People when the diner did not filter by people (a pair is the most common table). */
const DEFAULT_PARTY_SIZE = 2;

export interface ReserveSheetProps {
  visible: boolean;
  onClose: () => void;
  restaurant: { id: string; name: string; reservationTtlMinutes?: number };
  /** The people filter of the search, if the diner chose one (CLAUDE.md §12.1: it comes preloaded). */
  initialPartySize?: number;
  /** A reservation could not be made here (closed, no table, gone): the detail asks its availability again. */
  onUnavailable?: () => void;
}

/** How long the table is kept: the backend's real validity as a big figure, or the general text without it. */
function ValidityCard({ ttlMinutes }: { ttlMinutes?: number }) {
  const minutes = validityMinutes(ttlMinutes);
  return (
    <GlassCard className="flex-row items-center gap-3.5 p-4">
      <View className="h-11 w-11 items-center justify-center rounded-chip bg-accent/15">
        <Icon icon={Timer} size={22} color="accentText" strokeWidth={2} />
      </View>
      {minutes ? (
        <View className="min-w-0 flex-1" accessible accessibilityLabel={validityText(ttlMinutes)}>
          <Text variant="small" tone="caption">
            {RESERVATION_TEXT.validityLabel}
          </Text>
          <Text variant="stat">{minutes}</Text>
          <Text variant="sec" tone="secondary">
            {RESERVATION_TEXT.validityHint}
          </Text>
        </View>
      ) : (
        <Text variant="sec" className="min-w-0 flex-1">
          {validityText(ttlMinutes)}
        </Text>
      )}
    </GlassCard>
  );
}

/**
 * «Reservar mesa» (Tasks 1.1.5 and 1.1.6, reparto 9.2) as a glass sheet (mobile v3, the dashboard's glass): the
 * restaurant as the title, people (1–20, preloaded with the filter) and the real validity of the backend, and «Reservar ahora» → POST /reservations. The button turns «Reservando…» and cannot be
 * pressed again until the answer. 201 → the reservation screen; each errorCode shows its exact text (§12.9).
 */
export function ReserveSheet({ visible, onClose, restaurant, initialPartySize, onUnavailable }: ReserveSheetProps) {
  const create = useCreateReservation();
  const openActive = useOpenActiveReservation();
  const { showToast } = useToast();
  const [partySize, setPartySize] = useState(initialPartySize ?? DEFAULT_PARTY_SIZE);
  const [failure, setFailure] = useState<CreateErrorView | null>(null);

  function close() {
    setFailure(null);
    onClose();
  }

  async function reserve() {
    if (create.isPending) return;
    primaryTapHaptic();
    setFailure(null);
    try {
      const reservation = await create.mutateAsync({ restaurantId: restaurant.id, partySize });
      onClose();
      router.replace({ pathname: '/reserva/[id]', params: { id: reservation.id } });
    } catch (error) {
      const view = createErrorView(error);
      setFailure(view);
      if (view.final && !view.showMine) onUnavailable?.();
    }
  }

  const failureAction = failure?.showMine ? (
    <Button
      size="sm"
      variant="outline"
      label={RESERVATION_TEXT.viewMine}
      onPress={async () => {
        close();
        try {
          await openActive();
        } catch (error) {
          showToast({ type: 'error', message: getErrorMessage(error) });
        }
      }}
    />
  ) : failure && !failure.final ? (
    <Button size="sm" variant="outline" label={RETRY_LABEL} onPress={reserve} />
  ) : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      variant="glass"
      kicker={RESERVATION_TEXT.sheetTitle}
      title={restaurant.name}
      footer={
        <Button
          shape="pill"
          size="xl"
          label={RESERVATION_TEXT.reserveNow}
          loading={create.isPending}
          loadingLabel={RESERVATION_TEXT.reserving}
          fullWidth
          onPress={reserve}
          disabled={failure?.final}
        />
      }
    >
      <GlassCard className="gap-3 px-4 pb-4 pt-3.5">
        <Text variant="strong" tone="caption">
          {RESERVATION_TEXT.peopleLabel}
        </Text>
        <NumberStepper
          size="lg"
          value={partySize}
          min={PARTY_SIZE_LIMITS.min}
          max={PARTY_SIZE_LIMITS.max}
          onChange={(next) => {
            setPartySize(next);
            if (failure && !failure.showMine) setFailure(null);
          }}
          accessibilityLabel={RESERVATION_TEXT.peopleLabel}
          formatValue={formatPeople}
          unit={(value) => (value === 1 ? 'persona' : 'personas')}
        />
      </GlassCard>
      <ValidityCard ttlMinutes={restaurant.reservationTtlMinutes} />
      {failure ? <Alert type="error" message={failure.message} action={failureAction} /> : null}
    </BottomSheet>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Alert, BottomSheet, Button, NumberStepper, RETRY_LABEL, Text, useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api/errors';
import { primaryTapHaptic } from '@/lib/haptics';
import { formatPeople } from '@/lib/format/table';

import { createErrorView, RESERVATION_TEXT, validityText, type CreateErrorView } from '../messages';
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text variant="sec" tone="secondary">
        {label}
      </Text>
      <Text variant="body" className="flex-1 text-right font-bold">
        {value}
      </Text>
    </View>
  );
}

/**
 * «Reservar mesa» (Tasks 1.1.5 and 1.1.6, reparto 9.2): people (1–20, preloaded with the filter), the summary with the
 * real validity of the backend, and «Reservar ahora» → POST /reservations. The button turns «Reservando…» and cannot be
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
      title={RESERVATION_TEXT.sheetTitle}
      footer={
        <Button
          label={RESERVATION_TEXT.reserveNow}
          loading={create.isPending}
          loadingLabel={RESERVATION_TEXT.reserving}
          fullWidth
          onPress={reserve}
          disabled={failure?.final}
        />
      }
    >
      <View className="gap-6">
        <View className="gap-2">
          <Text variant="fieldLabel">{RESERVATION_TEXT.peopleLabel}</Text>
          <NumberStepper
            value={partySize}
            min={PARTY_SIZE_LIMITS.min}
            max={PARTY_SIZE_LIMITS.max}
            onChange={(next) => {
              setPartySize(next);
              if (failure && !failure.showMine) setFailure(null);
            }}
            accessibilityLabel={RESERVATION_TEXT.peopleLabel}
            formatValue={formatPeople}
          />
        </View>
        <View className="gap-3">
          <SummaryRow label={RESERVATION_TEXT.summaryRestaurant} value={restaurant.name} />
          <SummaryRow label={RESERVATION_TEXT.summaryPeople} value={formatPeople(partySize)} />
          <Text variant="sec">{validityText(restaurant.reservationTtlMinutes)}</Text>
        </View>
        {failure ? <Alert type="error" message={failure.message} action={failureAction} /> : null}
      </View>
    </BottomSheet>
  );
}

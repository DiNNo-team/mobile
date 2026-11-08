import { router } from 'expo-router';
import { useState } from 'react';

import { Alert, Button, Dialog, useToast } from '@/components/ui';
import { ApiError, ErrorCode, getErrorMessage } from '@/lib/api/errors';

import { RESERVATION_TEXT } from '../messages';
import { useCancelReservation } from '../queries';

export interface CancelReservationProps {
  reservationId: string;
  /** Asks GET /reservations/:id again: after RESERVATION_NOT_ACTIVE the screen shows the real state. */
  onStale: () => void;
}

/**
 * «Cancelar reserva» (Task 3.1.2, reparto 9.2): asks first («¿Cancelar tu reserva? La mesa quedará libre para otra
 * persona.» · «Sí, cancelar» / «Mantener reserva»), then POST /reservations/:id/cancel. The answer (cancelled, no code)
 * replaces the reservation everywhere, so the screen turns «Cancelada» and the Explorar banner goes away.
 * RESERVATION_NOT_ACTIVE: it expired or was checked in meanwhile → the real state is asked. RESERVATION_NOT_FOUND →
 * back to Explorar (§12.9).
 */
export function CancelReservation({ reservationId, onStale }: CancelReservationProps) {
  const cancel = useCancelReservation();
  const { showToast } = useToast();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string>();

  function close() {
    if (cancel.isPending) return;
    setAsking(false);
    setError(undefined);
  }

  async function confirm() {
    setError(undefined);
    try {
      await cancel.mutateAsync(reservationId);
      setAsking(false);
    } catch (caught) {
      if (caught instanceof ApiError && caught.errorCode === ErrorCode.ReservationNotActive) {
        setAsking(false);
        onStale();
        return;
      }
      if (caught instanceof ApiError && caught.errorCode === ErrorCode.ReservationNotFound) {
        setAsking(false);
        showToast({ type: 'error', message: RESERVATION_TEXT.notFound });
        router.replace('/');
        return;
      }
      setError(getErrorMessage(caught, RESERVATION_TEXT.cancelFailed));
    }
  }

  return (
    <>
      <Button variant="outline" label={RESERVATION_TEXT.cancel} fullWidth onPress={() => setAsking(true)} />
      <Dialog
        visible={asking}
        onClose={close}
        title={RESERVATION_TEXT.cancelTitle}
        busy={cancel.isPending}
        actions={
          <>
            <Button
              variant="danger"
              label={RESERVATION_TEXT.cancelConfirm}
              loading={cancel.isPending}
              loadingLabel={RESERVATION_TEXT.cancelling}
              fullWidth
              onPress={confirm}
            />
            <Button variant="outline" label={RESERVATION_TEXT.cancelKeep} fullWidth onPress={close} disabled={cancel.isPending} />
          </>
        }
      >
        {error ? <Alert type="error" message={error} /> : null}
      </Dialog>
    </>
  );
}

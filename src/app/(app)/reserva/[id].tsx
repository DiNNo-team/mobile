import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, ScreenHeader, Skeleton, useDelayedLoading } from '@/components/ui';
import { CancelReservation } from '@/features/reservations/components/CancelReservation';
import { ReservationView } from '@/features/reservations/components/ReservationView';
import { RESERVATION_TEXT } from '@/features/reservations/messages';
import { useMonotonicNow, useReservation } from '@/features/reservations/queries';
import { remainingMs } from '@/features/reservations/timer';
import { ErrorCode, getErrorMessage, isApiError } from '@/lib/api/errors';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function ReservationSkeleton() {
  return (
    <View accessibilityLabel="Cargando tu reserva" className="items-center gap-4">
      <Skeleton className="h-6 w-24 rounded-chip" />
      <Skeleton className="h-14 w-40 rounded-card" />
      <Skeleton className="h-16 w-64 rounded-card" />
      <Skeleton className="h-48 w-full rounded-card" />
    </View>
  );
}

/** `reserva/[id]`: the diner's reservation, active or final (CLAUDE.md §12.8, GET /reservations/:id). */
export default function ReservationScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useReservation(id);
  const reservation = query.data;
  const now = useMonotonicNow(reservation?.status === 'active');
  const showSkeleton = useDelayedLoading(query.isPending);
  const atZero =
    reservation?.status === 'active' && remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, now) === 0;
  const { refetch } = query;

  // At 00:00 the screen says «Verificando…» and the backend confirms the final state (it expires a due reservation when
  // reading it, and its sweep runs every 15 s): ask now and every 5 s until it is not active anymore.
  useEffect(() => {
    if (!atZero) return;
    void refetch();
    const timer = setInterval(() => void refetch(), 5_000);
    return () => clearInterval(timer);
  }, [atZero, refetch]);

  const body = () => {
    if (reservation) {
      return (
        <ReservationView
          reservation={reservation}
          now={now}
          activeActions={atZero ? null : <CancelReservation reservationId={reservation.id} onStale={() => void refetch()} />}
        />
      );
    }
    if (query.isPending) return showSkeleton ? <ReservationSkeleton /> : null;
    if (isApiError(query.error, ErrorCode.ReservationNotFound) || isApiError(query.error) && query.error.status === 400) {
      return (
        <EmptyState
          title={RESERVATION_TEXT.notFound}
          description={RESERVATION_TEXT.notFoundDescription}
          action={<Button label={RESERVATION_TEXT.searchAnother} onPress={() => router.replace('/')} />}
        />
      );
    }
    return (
      <ErrorState
        title={RESERVATION_TEXT.loadFailed}
        description={getErrorMessage(query.error)}
        retrying={query.isFetching}
        onRetry={() => query.refetch()}
      />
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-6 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <ScreenHeader showBack onBack={goBack} size="h2" title="Tu reserva" />
      {body()}
    </ScrollView>
  );
}

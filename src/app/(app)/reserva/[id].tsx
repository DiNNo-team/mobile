import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, ErrorState, ScreenHeader, Skeleton, useDelayedLoading } from '@/components/ui';
import { ReservationView } from '@/features/reservations/components/ReservationView';
import { RESERVATION_TEXT } from '@/features/reservations/messages';
import { useMonotonicNow, useReservation } from '@/features/reservations/queries';
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

  const body = () => {
    if (reservation) return <ReservationView reservation={reservation} now={now} />;
    if (query.isPending) return showSkeleton ? <ReservationSkeleton /> : null;
    if (isApiError(query.error, ErrorCode.ReservationNotFound) || isApiError(query.error) && query.error.status === 400) {
      return (
        <EmptyState
          title="No encontramos esa reserva"
          description="Busca un restaurante con mesa disponible para reservar."
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

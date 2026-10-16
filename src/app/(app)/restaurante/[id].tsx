import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { PlaceholderLink, ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { Text } from '@/components/ui/Text';
import { searchApi } from '@/features/search/api';
import { getOriginCoordinates, useSearchStore } from '@/features/search/store';
import { ADDRESS_FALLBACK, getCategoryLabel } from '@/features/search/types';
import { ErrorCode, getErrorMessage, isApiError } from '@/lib/api/errors';
import { formatDistance } from '@/lib/format/distance';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Sends lat/lng only when the search uses the phone's position (Reparto: distance in the detail).
  const from = getOriginCoordinates(useSearchStore((state) => state.origin));
  const detail = useQuery({ queryKey: ['restaurant', id, from], queryFn: () => searchApi.getRestaurant(id, from) });

  const notFound = isApiError(detail.error, ErrorCode.RestaurantNotFound);
  const title = detail.data?.name ?? (notFound ? 'Este restaurante ya no está disponible' : 'Restaurante');

  return (
    <ScreenPlaceholder title={title} description="Horarios, disponibilidad y cómo llegar." owner="Sebastián · fase 5">
      {detail.isPending ? <Text variant="sec">Cargando…</Text> : null}
      {detail.isError && !notFound ? <Text variant="sec">{getErrorMessage(detail.error)}</Text> : null}
      {detail.data ? (
        <Text variant="sec">
          {[
            getCategoryLabel(detail.data.category),
            detail.data.address ?? ADDRESS_FALLBACK,
            detail.data.distanceKm === undefined ? null : formatDistance(detail.data.distanceKm),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
      <PlaceholderLink href="/" label="Volver a explorar" />
    </ScreenPlaceholder>
  );
}

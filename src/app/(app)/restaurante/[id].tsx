import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { PlaceholderLink, ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { Text } from '@/components/ui/Text';
import { searchApi } from '@/features/search/api';
import { RESTAURANT_CATEGORY_LABELS } from '@/features/search/types';
import { ErrorCode, getErrorMessage, isApiError } from '@/lib/api/errors';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useQuery({ queryKey: ['restaurant', id], queryFn: () => searchApi.getRestaurant(id) });

  const notFound = isApiError(detail.error, ErrorCode.RestaurantNotFound);
  const title = detail.data?.name ?? (notFound ? 'Este restaurante ya no está disponible' : 'Restaurante');

  return (
    <ScreenPlaceholder title={title} description="Horarios, disponibilidad y cómo llegar." owner="Sebastián · fase 5">
      {detail.isPending ? <Text variant="sec">Cargando…</Text> : null}
      {detail.isError && !notFound ? <Text variant="sec">{getErrorMessage(detail.error)}</Text> : null}
      {detail.data ? (
        <Text variant="sec">
          {RESTAURANT_CATEGORY_LABELS[detail.data.category]} · {detail.data.address}
        </Text>
      ) : null}
      <PlaceholderLink href="/" label="Volver a explorar" />
    </ScreenPlaceholder>
  );
}

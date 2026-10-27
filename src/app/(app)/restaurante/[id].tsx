import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Clock, MapIcon, Tag, type LucideIcon } from 'lucide-react-native';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Alert,
  AvailabilityChip,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  OpenStatusChip,
  RETRY_LABEL,
  ScreenHeader,
  Skeleton,
  StatusShape,
  Text,
  useDelayedLoading,
  useToast,
} from '@/components/ui';
import { RestaurantMapPreview } from '@/features/search/components/RestaurantMapPreview';
import { WeekSchedule } from '@/features/search/components/WeekSchedule';
import { getDirectionsUrl } from '@/features/search/filters';
import { useRestaurantDetail } from '@/features/search/queries';
import { getOriginCoordinates, useSearchStore } from '@/features/search/store';
import { ADDRESS_FALLBACK, getCategoryLabel, type RestaurantDetail } from '@/features/search/types';
import { ErrorCode, getErrorMessage, isApiError } from '@/lib/api/errors';
import { formatDistance } from '@/lib/format/distance';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function InfoRow({ icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="pt-1">
        <Icon icon={icon} size={16} color="text2" />
      </View>
      <Text variant="body" className="flex-1">
        {children}
      </Text>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View accessibilityLabel="Cargando restaurante" className="gap-4">
      <Skeleton className="h-44 rounded-card" />
      <Skeleton className="h-6 w-40 rounded-chip" />
      <Skeleton className="h-12 rounded-card" />
      <Skeleton className="h-12 rounded-btn" />
      <Skeleton className="h-64 rounded-card" />
    </View>
  );
}

function DetailContent({ restaurant }: { restaurant: RestaurantDetail }) {
  const { showToast } = useToast();
  const category = getCategoryLabel(restaurant.category);
  const address = restaurant.address ?? ADDRESS_FALLBACK;
  const place = restaurant.distanceKm === undefined ? address : `${address} · ${formatDistance(restaurant.distanceKm)}`;

  const openDirections = async () => {
    try {
      await Linking.openURL(getDirectionsUrl(restaurant));
    } catch {
      showToast({ type: 'error', message: 'No pudimos abrir Google Maps. Intenta de nuevo.' });
    }
  };

  return (
    <View className="gap-6">
      <RestaurantMapPreview restaurant={restaurant} />

      {/* One status row (manual 13.11): availability leads; "Abierto" is a quiet line next to it, not a second chip. */}
      {restaurant.isOpenNow ? (
        <View className="flex-row flex-wrap items-center gap-3">
          <AvailabilityChip availability={restaurant.availability} />
          <View className="flex-row items-center gap-1.5">
            <StatusShape shape="dot" color="ok" />
            <Text variant="sec">Abierto ahora</Text>
          </View>
        </View>
      ) : (
        <OpenStatusChip isOpen={false} />
      )}

      {restaurant.isOpenNow ? null : (
        <Alert type="info" message="Este restaurante está cerrado ahora. Revisa su horario para saber cuándo abre." />
      )}

      <View className="gap-3">
        <InfoRow icon={MapIcon}>{place}</InfoRow>
        {category ? <InfoRow icon={Tag}>{category}</InfoRow> : null}
      </View>

      <Button variant="secondary" icon={ArrowRight} label="Cómo llegar" fullWidth onPress={openDirections} />

      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Icon icon={Clock} size={20} />
          <Text variant="h3" accessibilityRole="header">
            Horarios
          </Text>
        </View>
        <WeekSchedule schedules={restaurant.schedules} />
      </View>
    </View>
  );
}

/** Detail (Reparto, PBI 3.2): availability, open or closed, hours of the week, distance and "Cómo llegar". */
export default function RestaurantDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  // Sends lat/lng only when the search uses the phone's position (Reparto: distance in the detail).
  const from = getOriginCoordinates(useSearchStore((state) => state.origin));
  const detail = useRestaurantDetail(id, from);
  const showSkeleton = useDelayedLoading(detail.isPending);
  const notFound = isApiError(detail.error, ErrorCode.RestaurantNotFound);

  const renderBody = () => {
    if (detail.data) {
      return (
        <>
          {detail.isError ? (
            // A failed refresh keeps the last data on screen and says so (the full error state is for no data).
            <Alert
              type="error"
              message={getErrorMessage(detail.error)}
              action={<Button size="sm" variant="outline" label={RETRY_LABEL} onPress={() => detail.refetch()} />}
            />
          ) : null}
          <DetailContent restaurant={detail.data} />
        </>
      );
    }
    if (detail.isPending) return showSkeleton ? <DetailSkeleton /> : null;
    if (notFound) {
      return (
        <EmptyState
          title="Este restaurante ya no está disponible"
          description="Puede que haya cambiado su información. Busca otros restaurantes cerca."
          action={<Button label="Volver a explorar" onPress={goBack} />}
        />
      );
    }
    return (
      <ErrorState
        title="No pudimos cargar el restaurante"
        description={getErrorMessage(detail.error)}
        retrying={detail.isFetching}
        onRetry={() => detail.refetch()}
      />
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-6 px-4"
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <ScreenHeader showBack onBack={goBack} size="h2" title={detail.data?.name ?? 'Restaurante'} />
      {renderBody()}
    </ScrollView>
  );
}

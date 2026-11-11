import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, ChevronLeft, MapIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGround } from '@/components/AmbientGround';
import {
  Alert,
  AvailabilityLabel,
  Button,
  EdgeFade,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  OPEN_STATUS_PRESENTATION,
  RETRY_LABEL,
  Skeleton,
  StatGroup,
  StatusLabel,
  Text,
  useDelayedLoading,
  useToast,
  type Stat,
} from '@/components/ui';
import { ReserveAction, useReserveNote } from '@/features/reservations/components/ReserveAction';
import { RestaurantMapPreview } from '@/features/search/components/RestaurantMapPreview';
import { WeekSchedule } from '@/features/search/components/WeekSchedule';
import { getDirectionsUrl } from '@/features/search/filters';
import { useRestaurantDetail } from '@/features/search/queries';
import { getTodayClosing } from '@/features/search/schedule';
import { getOriginCoordinates, useSearchStore } from '@/features/search/store';
import { ADDRESS_FALLBACK, getCategoryLabel, type RestaurantDetail } from '@/features/search/types';
import { ErrorCode, getErrorMessage, isApiError } from '@/lib/api/errors';
import { splitDistance } from '@/lib/format/distance';
import { env } from '@/config/env';
import { useTheme } from '@/theme/ThemeProvider';

/** Where the content starts (mobile v3): over the faded lower part of the map. */
const CONTENT_TOP = 244;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function DetailSkeleton() {
  return (
    <View accessibilityLabel="Cargando restaurante" className="gap-4">
      <Skeleton className="h-5 w-48 rounded-chip" />
      <Skeleton className="h-14 w-64 rounded-card" />
      <Skeleton className="h-20 rounded-piece" />
      <Skeleton className="h-6 w-56 rounded-chip" />
      <Skeleton className="h-56 rounded-card" />
    </View>
  );
}

/** The three facts that decide whether the diner goes: distance (only from the phone's position), closing and food. */
function getStats(restaurant: RestaurantDetail): Stat[] {
  const stats: Stat[] = [];
  if (restaurant.distanceKm !== undefined) {
    const distance = splitDistance(restaurant.distanceKm);
    stats.push({ value: `${distance.value} ${distance.unit}`, label: 'Distancia' });
  }
  const closing = getTodayClosing(restaurant.schedules);
  stats.push({ value: closing.value, label: closing.label });
  const category = getCategoryLabel(restaurant.category);
  if (category) stats.push({ value: category, label: 'Tipo de comida', wide: true });
  return stats;
}

function DetailContent({ restaurant }: { restaurant: RestaurantDetail }) {
  return (
    <View>
      {/* One status line (manual 13.11): availability leads; «Abierto ahora» is a quiet word next to it. */}
      <View className="flex-row flex-wrap items-center gap-2.5">
        {restaurant.isOpenNow ? (
          <>
            <AvailabilityLabel availability={restaurant.availability} />
            <View className="h-1 w-1 rounded-chip bg-line-strong" />
            <Text variant="sec" tone="secondary">
              Abierto ahora
            </Text>
          </>
        ) : (
          <StatusLabel status={OPEN_STATUS_PRESENTATION.closed} />
        )}
      </View>
      <Text variant="hero" accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6} className="mt-1">
        {restaurant.name}
      </Text>

      {restaurant.isOpenNow ? null : (
        <Alert type="info" message="Este restaurante está cerrado ahora. Revisa su horario para saber cuándo abre." className="mt-4" />
      )}

      <StatGroup stats={getStats(restaurant)} className="mt-4" />

      <View className="mt-4 flex-row items-start gap-2.5">
        <View className="pt-0.5">
          <Icon icon={MapIcon} size={18} color="text2" strokeWidth={2} />
        </View>
        <Text variant="lead" className="flex-1">
          {restaurant.address ?? ADDRESS_FALLBACK}
        </Text>
      </View>

      <Text variant="section" accessibilityRole="header" className="mt-[22px]">
        Horarios
      </Text>
      <View className="mt-2">
        <WeekSchedule schedules={restaurant.schedules} />
      </View>
    </View>
  );
}

/** The fixed bar at the bottom: «Cómo llegar →» and the orange «Reservar mesa», over a fade into the ground. */
function ActionBar({ restaurant, onHeight }: { restaurant: RestaurantDetail; onHeight: (height: number) => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const note = useReserveNote(restaurant);
  const [height, setHeight] = useState(0);

  const openDirections = async () => {
    try {
      await Linking.openURL(getDirectionsUrl(restaurant));
    } catch {
      showToast({ type: 'error', message: 'No pudimos abrir Google Maps. Intenta de nuevo.' });
    }
  };

  return (
    <View
      className="absolute inset-x-0 bottom-0"
      onLayout={(event) => {
        setHeight(event.nativeEvent.layout.height);
        onHeight(event.nativeEvent.layout.height);
      }}
    >
      {height > 0 ? <EdgeFade color={colors.bg} height={height} direction="up" solidAt={0.3} style={{ position: 'absolute', left: 0, right: 0, top: 0 }} /> : null}
      <View className="gap-2.5 px-4 pt-[26px]" style={{ paddingBottom: insets.bottom + 22 }}>
        {note ? (
          <Text variant="sec" tone="secondary" className="text-center">
            {note}
          </Text>
        ) : null}
        <View className="flex-row gap-2.5">
          <Button variant="soft" shape="pill" size="xl" label="Cómo llegar" trailingIcon={ArrowRight} onPress={openDirections} />
          <View className="flex-1">
            <ReserveAction restaurant={restaurant} />
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Detail (Reparto, PBI 3.2; mobile v3 «Restaurante»): the leaning map with the restaurant as a light, its state, the
 * name big, distance · closing · food, the address, the week's hours and a fixed bar with «Cómo llegar» and «Reservar
 * mesa».
 */
export default function RestaurantDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  // Sends lat/lng only when the search uses the phone's position (Reparto: distance in the detail).
  const from = getOriginCoordinates(useSearchStore((state) => state.origin));
  const detail = useRestaurantDetail(id, from);
  const showSkeleton = useDelayedLoading(detail.isPending);
  const notFound = isApiError(detail.error, ErrorCode.RestaurantNotFound);
  const [barHeight, setBarHeight] = useState(0);
  const restaurant = detail.data;
  // Without the map (no key, or still loading) the content starts right under the back button.
  const top = restaurant && env.mapsEnabled ? Math.max(CONTENT_TOP, insets.top + 190) : insets.top + 72;

  const renderBody = () => {
    if (restaurant) {
      return (
        <>
          {detail.isError ? (
            // A failed refresh keeps the last data on screen and says so (the full error state is for no data).
            <Alert
              type="error"
              message={getErrorMessage(detail.error)}
              action={<Button size="sm" variant="outline" label={RETRY_LABEL} onPress={() => detail.refetch()} />}
              className="mb-4"
            />
          ) : null}
          <DetailContent restaurant={restaurant} />
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
    <View className="flex-1 bg-bg">
      {restaurant ? <RestaurantMapPreview restaurant={restaurant} /> : null}
      <AmbientGround variant="screen" overlay />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        contentContainerStyle={{ paddingTop: top, paddingBottom: (restaurant ? barHeight : insets.bottom) + 16 }}
      >
        {renderBody()}
      </ScrollView>
      <View className="absolute left-4" style={{ top: insets.top + 8 }}>
        <IconButton
          variant={restaurant && env.mapsEnabled ? 'overMap' : 'raised'}
          icon={ChevronLeft}
          accessibilityLabel="Volver"
          onPress={goBack}
        />
      </View>
      {restaurant ? <ActionBar restaurant={restaurant} onHeight={setBarHeight} /> : null}
    </View>
  );
}

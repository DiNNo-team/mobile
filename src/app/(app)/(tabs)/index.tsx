import { router } from 'expo-router';
import { MapIcon } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ErrorState, ScreenHeader, Text, useDelayedLoading, useToast } from '@/components/ui';
import { LOCATION_FAILURE_MESSAGES } from '@/features/location/location';
import { useLocationFlow } from '@/features/location/use-location-flow';
import { OriginSheet } from '@/features/search/components/OriginSheet';
import { RestaurantCard, RestaurantListSkeleton } from '@/features/search/components/RestaurantCard';
import { LocationIntro, NoResults, ZonePrompt } from '@/features/search/components/SearchStates';
import { getZoneName, useRestaurantSearch, useZones } from '@/features/search/queries';
import { getNextRadius, useSearchStore } from '@/features/search/store';
import type { RestaurantSummary } from '@/features/search/types';
import { getErrorMessage } from '@/lib/api/errors';
import { useTheme } from '@/theme/ThemeProvider';

function resultsLabel(count: number): string {
  return count === 1 ? '1 restaurante abierto' : `${count} restaurantes abiertos, del más cercano al más lejano`;
}

/** Explorar: where to search (position or zone) and the results, nearest first (PBI 2.1, 2.2, 2.3 and 3.1). */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const origin = useSearchStore((state) => state.origin);
  const filters = useSearchStore((state) => state.filters);
  const setLocation = useSearchStore((state) => state.setLocation);
  const setZone = useSearchStore((state) => state.setZone);
  const setRadius = useSearchStore((state) => state.setRadius);
  const [sheetOpen, setSheetOpen] = useState(false);
  const zones = useZones();
  const search = useRestaurantSearch(origin, filters);

  const location = useLocationFlow({
    hasOrigin: origin !== null,
    onLocated: setLocation,
    onFailed: (failure) => {
      // With results on screen they stay and a toast explains; without an origin the app moves on to zones.
      if (useSearchStore.getState().origin) showToast({ type: 'warning', message: LOCATION_FAILURE_MESSAGES[failure] });
      else setSheetOpen(true);
    },
  });

  const loadingResults = origin !== null && search.isPending;
  const showSkeleton = useDelayedLoading(loadingResults || location.step === 'checking');

  const locateMe = () => {
    setSheetOpen(false);
    location.locate();
  };
  const chooseZone = (zoneId: string) => {
    location.cancel();
    setZone(zoneId);
    setSheetOpen(false);
  };
  const openZones = () => {
    if (location.step === 'explain') location.cancel();
    setSheetOpen(true);
  };
  const openDetail = (restaurant: RestaurantSummary) =>
    router.push({ pathname: '/restaurante/[id]', params: { id: restaurant.id } });

  const place = origin?.type === 'zone' ? getZoneName(zones.data, origin.zoneId) : 'Cerca de ti';
  const subtitle =
    location.step === 'locating' ? 'Buscando tu ubicación…' : origin ? `${place} · ${filters.radiusKm} km` : undefined;

  const renderEmpty = () => {
    if (!origin) {
      if (location.step === 'explain') return <LocationIntro onUseLocation={locateMe} onChooseZone={openZones} />;
      if (location.step === 'locating') return <RestaurantListSkeleton />;
      if (location.step === 'checking') return showSkeleton ? <RestaurantListSkeleton /> : null;
      return <ZonePrompt failure={location.failure} onChooseZone={openZones} onUseLocation={locateMe} />;
    }
    if (loadingResults) return showSkeleton ? <RestaurantListSkeleton /> : null;
    if (search.isError) {
      return (
        <ErrorState
          title="No pudimos cargar los restaurantes"
          description={getErrorMessage(search.error)}
          retrying={search.isFetching}
          onRetry={() => search.refetch()}
        />
      );
    }
    return (
      <NoResults
        place={origin.type === 'zone' ? `de ${place}` : 'de tu ubicación'}
        radiusKm={filters.radiusKm}
        nextRadiusKm={getNextRadius(filters.radiusKm)}
        onWiden={setRadius}
        onChangeZone={openZones}
      />
    );
  };

  const results = search.isSuccess ? search.data : [];

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 16 }}>
      <ScreenHeader
        title="Explorar"
        subtitle={subtitle}
        className="px-4 pb-4"
        actions={
          origin ? <Button variant="ghost" size="sm" icon={MapIcon} label="Cambiar zona" onPress={openZones} className="-mr-4" /> : undefined
        }
      />
      <FlatList
        data={results}
        keyExtractor={(restaurant) => restaurant.id}
        renderItem={({ item }) => <RestaurantCard restaurant={item} onPress={() => openDetail(item)} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          results.length > 0 ? (
            <Text variant="sec" tone="secondary" className="mb-3">
              {resultsLabel(results.length)}
            </Text>
          ) : null
        }
        ListEmptyComponent={renderEmpty()}
        contentContainerClassName="px-4 pb-6"
        refreshControl={
          origin && search.isSuccess ? (
            <RefreshControl
              refreshing={search.isRefetching}
              onRefresh={() => search.refetch()}
              colors={[colors.accent]}
              progressBackgroundColor={colors.surface}
              tintColor={colors.accent}
            />
          ) : undefined
        }
      />
      <OriginSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        origin={origin}
        failure={origin ? null : location.failure}
        onUseLocation={locateMe}
        onSelectZone={chooseZone}
      />
    </View>
  );
}

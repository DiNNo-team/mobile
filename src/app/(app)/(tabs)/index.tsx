import { router } from 'expo-router';
import { MapIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, Button, ErrorState, RETRY_LABEL, ScreenHeader, SegmentedControl, Text, useDelayedLoading, useToast } from '@/components/ui';
import { env } from '@/config/env';
import { LOCATION_FAILURE_MESSAGES } from '@/features/location/location';
import { useLocationFlow } from '@/features/location/use-location-flow';
import { ActiveFilters } from '@/features/search/components/ActiveFilters';
import { FiltersSheet } from '@/features/search/components/FiltersSheet';
import { OriginSheet } from '@/features/search/components/OriginSheet';
import { RestaurantCard, RestaurantListSkeleton } from '@/features/search/components/RestaurantCard';
import { ResultsCarousel, type ResultsCarouselHandle } from '@/features/search/components/ResultsCarousel';
import { ResultsMap, type ResultsMapHandle } from '@/features/search/components/ResultsMap';
import { LocationIntro, NoResults, ZonePrompt } from '@/features/search/components/SearchStates';
import { removeFilter } from '@/features/search/filters';
import { getZoneName, useRestaurantSearch, useZones } from '@/features/search/queries';
import { getNextRadius, getOriginCoordinates, useSearchStore } from '@/features/search/store';
import type { Coordinates, RestaurantSummary } from '@/features/search/types';
import { getErrorMessage } from '@/lib/api/errors';
import { useTheme } from '@/theme/ThemeProvider';

type ResultsView = 'map' | 'list';

const VIEW_OPTIONS = [
  { value: 'map', label: 'Mapa' },
  { value: 'list', label: 'Lista' },
] as const satisfies readonly { value: ResultsView; label: string }[];

/** Center of Bogotá, only while the zone list has not loaded yet. */
const BOGOTA: Coordinates = { latitude: 4.65, longitude: -74.06 };

function resultsLabel(count: number): string {
  return count === 1 ? '1 restaurante abierto' : `${count} restaurantes abiertos, del más cercano al más lejano`;
}

/**
 * Explorar: where to search (position or zone), filters and the results on a map synced with the cards, or
 * as a list, nearest first (PBI 2.1, 2.2, 2.3, 3.1, 4.1 and 4.2). Without the Maps key it shows only the list.
 */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const origin = useSearchStore((state) => state.origin);
  const filters = useSearchStore((state) => state.filters);
  const setLocation = useSearchStore((state) => state.setLocation);
  const setZone = useSearchStore((state) => state.setZone);
  const setRadius = useSearchStore((state) => state.setRadius);
  const setFilters = useSearchStore((state) => state.setFilters);
  const clearFilters = useSearchStore((state) => state.clearFilters);
  const [originSheetOpen, setOriginSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // A new key each time the filters sheet opens: its copy of the filters starts from the applied ones.
  const [filtersSheetKey, setFiltersSheetKey] = useState(0);
  const [view, setView] = useState<ResultsView>(env.mapsEnabled ? 'map' : 'list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const map = useRef<ResultsMapHandle>(null);
  const carousel = useRef<ResultsCarouselHandle>(null);
  const zones = useZones();
  const search = useRestaurantSearch(origin, filters);

  const location = useLocationFlow({
    hasOrigin: origin !== null,
    onLocated: setLocation,
    onFailed: (failure) => {
      // With results on screen they stay and a toast explains; without an origin the app moves on to zones.
      if (useSearchStore.getState().origin) showToast({ type: 'warning', message: LOCATION_FAILURE_MESSAGES[failure] });
      else setOriginSheetOpen(true);
    },
  });

  const results = search.data ?? [];
  const loadingResults = origin !== null && search.isPending;
  const showSkeleton = useDelayedLoading(loadingResults || location.step === 'checking');
  const searchingAgain = search.isFetching && search.isPlaceholderData;
  const showMap = env.mapsEnabled && view === 'map' && results.length > 0;
  // On the map one card is always the current one: the chosen restaurant, or the nearest.
  const activeId = results.some((restaurant) => restaurant.id === selectedId) ? selectedId : showMap ? (results[0]?.id ?? null) : null;

  const userLocation = getOriginCoordinates(origin);
  const zone = origin?.type === 'zone' ? zones.data?.find((item) => item.id === origin.zoneId) : undefined;
  const center = userLocation ?? (zone ? { latitude: zone.latitude, longitude: zone.longitude } : (results[0] ?? BOGOTA));

  const locateMe = () => {
    setOriginSheetOpen(false);
    location.locate();
  };
  const chooseZone = (zoneId: string) => {
    location.cancel();
    setZone(zoneId);
    setOriginSheetOpen(false);
  };
  const openZones = () => {
    if (location.step === 'explain') location.cancel();
    setOriginSheetOpen(true);
  };
  const openFilters = () => {
    setFiltersSheetKey((key) => key + 1);
    setFiltersOpen(true);
  };
  const openDetail = (restaurant: RestaurantSummary) => {
    setSelectedId(restaurant.id);
    router.push({ pathname: '/restaurante/[id]', params: { id: restaurant.id } });
  };
  const selectFromMap = (restaurant: RestaurantSummary) => {
    setSelectedId(restaurant.id);
    carousel.current?.scrollTo(restaurant.id);
  };
  const selectFromCards = (restaurant: RestaurantSummary) => {
    setSelectedId(restaurant.id);
    map.current?.focus(restaurant);
  };

  const place = origin?.type === 'zone' ? getZoneName(zones.data, origin.zoneId) : 'Cerca de ti';
  const subtitle =
    location.step === 'locating'
      ? 'Buscando tu ubicación…'
      : searchingAgain
        ? 'Buscando restaurantes…'
        : origin
          ? `${place} · ${filters.radiusKm} km`
          : undefined;

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
        filtered={!!filters.category || !!filters.partySize}
        searching={searchingAgain}
        onWiden={setRadius}
        onChangeFilters={openFilters}
        onChangeZone={openZones}
      />
    );
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top + 16 }}>
      <ScreenHeader
        title="Explorar"
        subtitle={subtitle}
        className="px-4 pb-3"
        actions={
          origin ? (
            <Button variant="ghost" size="sm" icon={MapIcon} label="Cambiar zona" onPress={openZones} className="-mr-4" />
          ) : undefined
        }
      />

      {origin ? (
        <View className="gap-3 pb-3">
          {env.mapsEnabled ? (
            <SegmentedControl
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
              accessibilityLabel="Ver resultados como"
              className="mx-4"
            />
          ) : null}
          <ActiveFilters
            filters={filters}
            onOpen={openFilters}
            onRemove={(key) => setFilters(removeFilter(filters, key))}
            onClear={clearFilters}
          />
        </View>
      ) : null}

      {search.isError && results.length > 0 ? (
        // An error while results are on screen keeps them and says so above (the full error state is for no data).
        <Alert
          type="error"
          message={getErrorMessage(search.error)}
          action={<Button size="sm" variant="outline" label={RETRY_LABEL} onPress={() => search.refetch()} />}
          className="mx-4 mb-3"
        />
      ) : null}

      {showMap ? (
        <View className="flex-1">
          <ResultsMap
            ref={map}
            restaurants={results}
            selectedId={activeId}
            onSelect={selectFromMap}
            center={center}
            radiusKm={filters.radiusKm}
            userLocation={userLocation}
            bottomInset={carouselHeight}
          />
          <ResultsCarousel
            ref={carousel}
            restaurants={results}
            selectedId={activeId}
            onSelect={selectFromCards}
            onOpen={openDetail}
            onLayout={(event) => setCarouselHeight(event.nativeEvent.layout.height)}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(restaurant) => restaurant.id}
          renderItem={({ item }) => (
            <RestaurantCard restaurant={item} selected={item.id === activeId} onPress={() => openDetail(item)} />
          )}
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
                refreshing={search.isRefetching && !search.isPlaceholderData}
                onRefresh={() => search.refetch()}
                colors={[colors.accent]}
                progressBackgroundColor={colors.surface}
                tintColor={colors.accent}
              />
            ) : undefined
          }
        />
      )}

      <OriginSheet
        visible={originSheetOpen}
        onClose={() => setOriginSheetOpen(false)}
        origin={origin}
        failure={origin ? null : location.failure}
        onUseLocation={locateMe}
        onSelectZone={chooseZone}
      />
      <FiltersSheet
        key={filtersSheetKey}
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
        }}
      />
    </View>
  );
}

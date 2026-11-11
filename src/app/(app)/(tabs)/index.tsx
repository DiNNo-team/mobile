import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGround } from '@/components/AmbientGround';
import { Alert, Button, EdgeFade, ErrorState, RETRY_LABEL, Text, useDelayedLoading, useToast } from '@/components/ui';
import { env } from '@/config/env';
import { LOCATION_FAILURE_MESSAGES } from '@/features/location/location';
import { useLocationFlow } from '@/features/location/use-location-flow';
import { ExploreHeader, type ResultsView } from '@/features/search/components/ExploreHeader';
import { FiltersSheet } from '@/features/search/components/FiltersSheet';
import { OriginSheet } from '@/features/search/components/OriginSheet';
import { RestaurantCard, RestaurantListSkeleton } from '@/features/search/components/RestaurantCard';
import { ActiveReservationBanner } from '@/features/reservations/components/ActiveReservationBanner';
import { ResultsCarousel, type ResultsCarouselHandle } from '@/features/search/components/ResultsCarousel';
import { ResultsMap, type ResultsMapHandle } from '@/features/search/components/ResultsMap';
import { LocationIntro, NoResults, ZonePrompt } from '@/features/search/components/SearchStates';
import { getActiveFilters, removeFilter } from '@/features/search/filters';
import { getZoneName, useRestaurantSearch, useZones } from '@/features/search/queries';
import type { LocatedAddress } from '@/features/search/components/AddressSearch';
import { getNextRadius, getOriginCoordinates, getUserLocation, useSearchStore } from '@/features/search/store';
import type { Coordinates, RestaurantSummary } from '@/features/search/types';
import { getErrorMessage } from '@/lib/api/errors';
import { useTheme } from '@/theme/ThemeProvider';

/** Center of Bogotá, only while the zone list has not loaded yet. */
const BOGOTA: Coordinates = { latitude: 4.65, longitude: -74.06 };

function resultsLabel(count: number): string {
  return count === 1 ? '1 restaurante abierto' : `${count} restaurantes abiertos, del más cercano al más lejano`;
}

/**
 * Explorar: where to search (position, typed address or zone), filters and the results on a map synced with the cards, or
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
  const setAddress = useSearchStore((state) => state.setAddress);
  const setRadius = useSearchStore((state) => state.setRadius);
  const setFilters = useSearchStore((state) => state.setFilters);
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
  // Locating and then searching are one wait for the diner: one skeleton, without a blank gap between them.
  const showSkeleton = useDelayedLoading(loadingResults || location.step === 'checking' || location.step === 'locating');
  const searchingAgain = search.isFetching && search.isPlaceholderData;
  const showMap = env.mapsEnabled && view === 'map' && results.length > 0;
  // On the map one card is always the current one: the chosen restaurant, or the nearest.
  const activeId = results.some((restaurant) => restaurant.id === selectedId) ? selectedId : showMap ? (results[0]?.id ?? null) : null;

  // The orange dot is the diner's own position (GPS only); a typed address is just the center of the search.
  const userLocation = getUserLocation(origin);
  const zone = origin?.type === 'zone' ? zones.data?.find((item) => item.id === origin.zoneId) : undefined;
  const center =
    getOriginCoordinates(origin) ?? (zone ? { latitude: zone.latitude, longitude: zone.longitude } : (results[0] ?? BOGOTA));

  const locateMe = () => {
    setOriginSheetOpen(false);
    location.locate();
  };
  const chooseZone = (zoneId: string) => {
    location.cancel();
    setZone(zoneId);
    setOriginSheetOpen(false);
  };
  const chooseAddress = (address: LocatedAddress) => {
    location.cancel();
    setAddress(address);
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
    map.current?.focus(restaurant);
  };
  const selectFromCards = (restaurant: RestaurantSummary) => {
    setSelectedId(restaurant.id);
    map.current?.focus(restaurant);
  };

  // The title is the zone's name, or «Cerca de ti» around the phone or a typed address. An address shows what Google
  // understood («Cerca de: …», CLAUDE.md §10) in the search field, so the diner can correct it.
  const title = origin?.type === 'zone' ? getZoneName(zones.data, origin.zoneId) : 'Cerca de ti';
  const place =
    origin?.type === 'zone'
      ? getZoneName(zones.data, origin.zoneId)
      : origin?.type === 'address'
        ? `Cerca de: ${origin.formattedAddress}`
        : undefined;
  const detail =
    location.step === 'locating'
      ? 'Buscando tu ubicación…'
      : searchingAgain
        ? 'Buscando…'
        : origin
          ? `· ${filters.radiusKm} km`
          : undefined;
  const activeFilters = getActiveFilters(filters);

  const renderEmpty = () => {
    if (!origin) {
      if (location.step === 'explain') return <LocationIntro onUseLocation={locateMe} onChooseZone={openZones} />;
      if (location.step === 'locating' || location.step === 'checking') return showSkeleton ? <RestaurantListSkeleton /> : null;
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
        place={
          origin.type === 'zone' ? `de ${title}` : origin.type === 'address' ? `de ${origin.formattedAddress}` : 'de tu ubicación'
        }
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

  const errorAlert =
    search.isError && results.length > 0 ? (
      // An error while results are on screen keeps them and says so (the full error state is for no data).
      <Alert
        type="error"
        message={getErrorMessage(search.error)}
        action={<Button size="sm" variant="outline" label={RETRY_LABEL} onPress={() => search.refetch()} />}
      />
    ) : null;

  return (
    <View className="flex-1" style={{ paddingTop: insets.top + 12 }}>
      <AmbientGround variant="screen" />
      <ExploreHeader
        title={title}
        detail={detail}
        place={place}
        view={view}
        showViewToggle={env.mapsEnabled && results.length > 0}
        onChangeView={setView}
        onSearch={openZones}
        onProfile={() => router.push('/perfil')}
        onFilters={openFilters}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => setFilters(removeFilter(filters, key))}
      />

      {showMap ? (
        // The map is the product (manual 13.11), framed (mobile v3): the night map in dark, paper tones in light, with the
        // editorial card of the selected restaurant at the bottom of the frame.
        <View
          className="mx-3 mt-3 flex-1 overflow-hidden rounded-frame"
          style={{ marginBottom: insets.bottom + 14, borderWidth: 4, borderColor: colors.mapFrame, backgroundColor: colors.mapGround, boxShadow: colors.shadowMap }}
        >
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
          <EdgeFade color={colors.mapFade} height={120} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
          <View pointerEvents="box-none" className="absolute inset-x-0 top-0 gap-2 p-2.5">
            <ActiveReservationBanner floating />
            {errorAlert}
          </View>
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
          className="mt-3"
          data={results}
          keyExtractor={(restaurant) => restaurant.id}
          renderItem={({ item }) => <RestaurantCard restaurant={item} onPress={() => openDetail(item)} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            <View className="gap-3 pb-3">
              <ActiveReservationBanner />
              {errorAlert}
              {results.length > 0 ? (
                <Text variant="sec" tone="caption">
                  {resultsLabel(results.length)}
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={renderEmpty()}
          contentContainerClassName="px-3"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
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
        onSelectAddress={chooseAddress}
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

import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Keyboard, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AmbientGround } from "@/components/AmbientGround";
import {
  Alert,
  Button,
  EdgeFade,
  ErrorState,
  RETRY_LABEL,
  Text,
  useDelayedLoading,
} from "@/components/ui";
import { env } from "@/config/env";
import { useOptionalLocation } from "@/features/location/use-optional-location";
import {
  ExploreHeader,
  type ResultsView,
} from "@/features/search/components/ExploreHeader";
import { FiltersSheet } from "@/features/search/components/FiltersSheet";
import {
  RestaurantCard,
  RestaurantListSkeleton,
} from "@/features/search/components/RestaurantCard";
import { ActiveReservationBanner } from "@/features/reservations/components/ActiveReservationBanner";
import {
  ResultsCarousel,
  type ResultsCarouselHandle,
} from "@/features/search/components/ResultsCarousel";
import {
  ResultsMap,
  type ResultsMapHandle,
} from "@/features/search/components/ResultsMap";
import { NoResults } from "@/features/search/components/SearchStates";
import {
  filterByName,
  getActiveFilters,
  removeFilter,
} from "@/features/search/filters";
import { useRestaurantSearch } from "@/features/search/queries";
import { useSearchStore } from "@/features/search/store";
import type { RestaurantSummary } from "@/features/search/types";
import { getErrorMessage } from "@/lib/api/errors";
import { useTheme } from "@/theme/ThemeProvider";

function resultsLabel(count: number, byDistance: boolean): string {
  if (count === 1) return "1 restaurante abierto";
  return byDistance
    ? `${count} restaurantes abiertos, del más cercano al más lejano`
    : `${count} restaurantes abiertos`;
}

/**
 * Explorar (Sprint 4): every restaurant that can be booked now, on a map that opens showing all of them (synced with
 * the cards) or as a list, filtered by name as the diner types, by category and by people. The phone's position is
 * optional: with it the cards say «a 650 m» and come closest first. Without the Maps key it shows only the list.
 */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const location = useSearchStore((state) => state.location);
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const setLocation = useSearchStore((state) => state.setLocation);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setFilters = useSearchStore((state) => state.setFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // A new key each time the filters sheet opens: its copy of the filters starts from the applied ones.
  const [filtersSheetKey, setFiltersSheetKey] = useState(0);
  const [view, setView] = useState<ResultsView>(
    env.mapsEnabled ? "map" : "list",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const map = useRef<ResultsMapHandle>(null);
  const carousel = useRef<ResultsCarouselHandle>(null);
  const search = useRestaurantSearch(location, filters);
  const { locating } = useOptionalLocation({
    known: location !== null,
    onLocated: setLocation,
  });

  const allResults = search.data ?? [];
  const results = filterByName(allResults, query);
  const trimmedQuery = query.trim();
  const loadingResults = search.isPending;
  const showSkeleton = useDelayedLoading(loadingResults);
  const searchingAgain = search.isFetching && search.isPlaceholderData;
  const showMap = env.mapsEnabled && view === "map" && results.length > 0;
  // On the map one card is always the current one: the chosen restaurant, or the first.
  const activeId = results.some((restaurant) => restaurant.id === selectedId)
    ? selectedId
    : showMap
      ? (results[0]?.id ?? null)
      : null;

  const openFilters = () => {
    Keyboard.dismiss();
    setFiltersSheetKey((key) => key + 1);
    setFiltersOpen(true);
  };
  const openDetail = (restaurant: RestaurantSummary) => {
    Keyboard.dismiss();
    setSelectedId(restaurant.id);
    router.push({
      pathname: "/restaurante/[id]",
      params: { id: restaurant.id },
    });
  };
  const selectFromMap = (restaurant: RestaurantSummary) => {
    Keyboard.dismiss();
    setSelectedId(restaurant.id);
    carousel.current?.scrollTo(restaurant.id);
    map.current?.focus(restaurant);
  };
  const selectFromCards = (restaurant: RestaurantSummary) => {
    setSelectedId(restaurant.id);
    map.current?.focus(restaurant);
  };

  const detail = searchingAgain
    ? "Buscando…"
    : locating
      ? "Buscando tu ubicación…"
      : undefined;
  const activeFilters = getActiveFilters(filters);

  const renderEmpty = () => {
    if (loadingResults) return showSkeleton ? <RestaurantListSkeleton /> : null;
    if (search.isError && allResults.length === 0) {
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
        query={trimmedQuery}
        filtered={activeFilters.length > 0}
        onClearQuery={() => setQuery("")}
        onChangeFilters={openFilters}
      />
    );
  };

  const errorAlert =
    search.isError && allResults.length > 0 ? (
      // An error while results are on screen keeps them and says so (the full error state is for no data).
      <Alert
        type="error"
        message={getErrorMessage(search.error)}
        action={
          <Button
            size="sm"
            variant="outline"
            label={RETRY_LABEL}
            onPress={() => search.refetch()}
          />
        }
      />
    ) : null;

  return (
    <View className="flex-1" style={{ paddingTop: insets.top + 12 }}>
      <AmbientGround variant="screen" />
      <ExploreHeader
        title="Restaurantes"
        detail={detail}
        query={query}
        onChangeQuery={setQuery}
        view={view}
        showViewToggle={env.mapsEnabled && results.length > 0}
        onChangeView={setView}
        onProfile={() => router.push("/perfil")}
        onFilters={openFilters}
        activeFilters={activeFilters}
        onRemoveFilter={(key) => setFilters(removeFilter(filters, key))}
      />

      {showMap ? (
        // The map is the product (manual 13.11), framed (mobile v3): the night map in dark, paper tones in light, with the
        // editorial card of the selected restaurant at the bottom of the frame.
        <View
          className="mx-3 mt-3 flex-1 overflow-hidden rounded-frame"
          style={{
            marginBottom: insets.bottom + 14,
            borderWidth: 4,
            borderColor: colors.mapFrame,
            backgroundColor: colors.mapGround,
            boxShadow: colors.shadowMap,
          }}
        >
          <ResultsMap
            ref={map}
            restaurants={results}
            selectedId={activeId}
            onSelect={selectFromMap}
            userLocation={location ?? undefined}
            bottomInset={carouselHeight}
          />
          <EdgeFade
            color={colors.mapFade}
            height={120}
            style={{ position: "absolute", top: 0, left: 0, right: 0 }}
          />
          <View
            pointerEvents="box-none"
            className="absolute inset-x-0 top-0 gap-2 p-2.5"
          >
            <ActiveReservationBanner floating />
            {errorAlert}
          </View>
          <ResultsCarousel
            ref={carousel}
            restaurants={results}
            selectedId={activeId}
            onSelect={selectFromCards}
            onOpen={openDetail}
            onLayout={(event) =>
              setCarouselHeight(event.nativeEvent.layout.height)
            }
          />
        </View>
      ) : (
        <FlatList
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          className="mt-3"
          data={results}
          keyExtractor={(restaurant) => restaurant.id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => openDetail(item)}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            <View className="gap-3 pb-3">
              <ActiveReservationBanner />
              {errorAlert}
              {results.length > 0 ? (
                <Text variant="sec" tone="caption">
                  {resultsLabel(results.length, location !== null)}
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={renderEmpty()}
          contentContainerClassName="px-3"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={
            search.isSuccess ? (
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

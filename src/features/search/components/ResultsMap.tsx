import { useEffect, useEffectEvent, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { AvailabilityMarker, SELECTED_MARKER, SelectedMarker, UserLocationMarker } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

import { FOCUS_MS, FOCUS_ZOOM, EXPLORE_MIN_ZOOM, getFitCamera, getMapStyle, MAP_PITCH } from '../map';
import type { Coordinates, RestaurantSummary } from '../types';

const CAMERA_MS = 300;
/**
 * A new pin draws its view for this long and then freezes (tracksViewChanges off). Freezing at once can catch
 * the view before it is laid out, and Android then shows Google's generic red pin, which the manual forbids.
 */
const MARKER_SETTLE_MS = 500;
const CENTER_ANCHOR = { x: 0.5, y: 0.5 };
/** The selected marker hangs from its dot: label + stem above it. */
const SELECTED_HEIGHT = SELECTED_MARKER.labelHeight + SELECTED_MARKER.stem + SELECTED_MARKER.dot + 16;
const SELECTED_ANCHOR = {
  x: 0.5,
  y: (SELECTED_MARKER.labelHeight + SELECTED_MARKER.stem - 2 + SELECTED_MARKER.dot / 2) / SELECTED_HEIGHT,
};
/** Room around the pins when the map fits them (dp); the top one clears the fade and the bottom one the card. */
const FIT_PADDING = 40;
const FIT_TOP = 110;
/** Zoom that shows about `radiusKm` around the center, for the first frame. */
function zoomForRadius(radiusKm: number): number {
  return Math.max(11, 15.5 - Math.log2(radiusKm));
}

interface RestaurantMarkerProps {
  restaurant: RestaurantSummary;
  selected: boolean;
  onSelect: (restaurant: RestaurantSummary) => void;
}

/** Pin of one restaurant: a light (mobile v3); the selected one rises on a stem with its name. */
function RestaurantMarker({ restaurant, selected, onSelect }: RestaurantMarkerProps) {
  const [settling, setSettling] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSettling(false), MARKER_SETTLE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      identifier={restaurant.id}
      coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
      anchor={selected ? SELECTED_ANCHOR : CENTER_ANCHOR}
      zIndex={selected ? 3 : 1}
      tracksViewChanges={settling}
      onPress={() => onSelect(restaurant)}
      accessibilityLabel={restaurant.name}
    >
      {selected ? (
        <SelectedMarker name={restaurant.name} availability={restaurant.availability} />
      ) : (
        <AvailabilityMarker availability={restaurant.availability} />
      )}
    </Marker>
  );
}

export interface ResultsMapHandle {
  /** Brings a restaurant's pin into view (the diner moved to its card): the camera leans in and comes closer. */
  focus: (restaurant: Coordinates) => void;
}

interface ResultsMapProps {
  ref?: Ref<ResultsMapHandle>;
  restaurants: RestaurantSummary[];
  selectedId: string | null;
  onSelect: (restaurant: RestaurantSummary) => void;
  /** Center of the search: the phone's position or the zone. */
  center: Coordinates;
  radiusKm: number;
  /** Only with the phone's position: the orange dot with the radar (decision of 15 oct). */
  userLocation?: Coordinates;
  /** Height covered by the editorial card at the bottom of the frame. */
  bottomInset: number;
}

/**
 * Google map of the results inside Explorar's frame (mobile v3): the camera leans (pitch 45), the night map in dark and
 * paper tones in light, and the tables as lights. `mapPadding` is set only after `onMapReady` (react-native-maps 1.27
 * crashes on Android when it arrives earlier).
 */
export function ResultsMap({
  ref,
  restaurants,
  selectedId,
  onSelect,
  center,
  radiusKm,
  userLocation,
  bottomInset,
}: ResultsMapProps) {
  const { colors, scheme } = useTheme();
  const map = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const mapStyle = useMemo(() => getMapStyle(colors), [colors]);
  // Only read when the map mounts.
  const [initialCamera] = useState(() => {
    const first = restaurants.find((restaurant) => restaurant.id === selectedId) ?? restaurants[0] ?? center;
    return {
      center: { latitude: first.latitude, longitude: first.longitude },
      zoom: EXPLORE_MIN_ZOOM,
      pitch: MAP_PITCH,
      heading: 0,
      altitude: 0,
    };
  });

  // New results (or a new position of the diner): show all of them at once. Selecting a card does not refit.
  const fitKey = [
    ...restaurants.map((restaurant) => restaurant.id),
    userLocation ? `${userLocation.latitude},${userLocation.longitude}` : '',
  ].join('|');
  const fitResults = useEffectEvent(() => {
    const points = [...restaurants, ...(userLocation ? [userLocation] : [])].map(({ latitude, longitude }) => ({
      latitude,
      longitude,
    }));
    if (!size || points.length === 0) return;
    // The map padding already keeps the card's height out, so the fit only needs the room under the top fade.
    const fit =
      points.length < 2
        ? { zoom: zoomForRadius(radiusKm) }
        : getFitCamera(points, size, { top: FIT_TOP, right: FIT_PADDING, bottom: FIT_PADDING, left: FIT_PADDING });
    // Close and leaning like the design: centered on the chosen restaurant (the nearest at first), at street level.
    const chosen = restaurants.find((restaurant) => restaurant.id === selectedId) ?? restaurants[0] ?? points[0];
    const zoom = Math.max(fit.zoom, EXPLORE_MIN_ZOOM);
    map.current?.animateCamera(
      { center: { latitude: chosen.latitude, longitude: chosen.longitude }, zoom, pitch: MAP_PITCH, heading: 0 },
      { duration: CAMERA_MS },
    );
  });
  useEffect(() => {
    if (ready) fitResults();
  }, [ready, fitKey, size]);

  useImperativeHandle(ref, () => ({
    focus: ({ latitude, longitude }) =>
      map.current?.animateCamera({ center: { latitude, longitude }, zoom: FOCUS_ZOOM, pitch: MAP_PITCH }, { duration: FOCUS_MS }),
  }));

  return (
    <View style={StyleSheet.absoluteFill} onLayout={(event) => setSize(event.nativeEvent.layout)}>
      <MapView
        ref={map}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialCamera={initialCamera}
        customMapStyle={mapStyle}
        onMapReady={() => setReady(true)}
        // Only once the map is ready (react-native-maps 1.27 crashes on Android with an early `mapPadding`): it keeps
        // the Google logo and the camera's center above the editorial card.
        mapPadding={ready ? { top: 0, right: 0, bottom: bottomInset, left: 0 } : undefined}
        moveOnMarkerPress={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false}
        showsIndoors={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        accessibilityLabel="Mapa de restaurantes"
      >
        {userLocation ? (
          // The radar moves, so this one marker keeps tracking its view.
          <Marker coordinate={userLocation} anchor={CENTER_ANCHOR} zIndex={0} tracksViewChanges>
            <UserLocationMarker />
          </Marker>
        ) : null}
        {restaurants.map((restaurant) => {
          const selected = restaurant.id === selectedId;
          return (
            <RestaurantMarker
              // A new key draws the pin again when it is selected, its availability changes or the theme changes.
              key={`${restaurant.id}-${restaurant.availability}-${selected}-${scheme}`}
              restaurant={restaurant}
              selected={selected}
              onSelect={onSelect}
            />
          );
        })}
      </MapView>
    </View>
  );
}

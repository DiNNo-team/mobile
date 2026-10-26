import { useEffect, useEffectEvent, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { AvailabilityMarker, UserLocationMarker } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

import { getMapStyle, getRegion } from '../map';
import type { Coordinates, RestaurantSummary } from '../types';

const CAMERA_MS = 300;
/**
 * A new pin draws its view for this long and then freezes (tracksViewChanges off). Freezing at once can catch
 * the view before it is laid out, and Android then shows Google's generic red pin, which the manual forbids.
 */
const MARKER_SETTLE_MS = 500;
const CENTER_ANCHOR = { x: 0.5, y: 0.5 };
/** Room around the pins when the map fits them (dp); the bottom one leaves the cards visible. */
const FIT_PADDING = 48;

interface RestaurantMarkerProps {
  restaurant: RestaurantSummary;
  selected: boolean;
  onSelect: (restaurant: RestaurantSummary) => void;
}

/** Pin of one restaurant: availability shape inside a badge; it tracks its view only while it settles. */
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
      anchor={CENTER_ANCHOR}
      zIndex={selected ? 2 : 1}
      tracksViewChanges={settling}
      onPress={() => onSelect(restaurant)}
      accessibilityLabel={restaurant.name}
    >
      <AvailabilityMarker availability={restaurant.availability} selected={selected} />
    </Marker>
  );
}

export interface ResultsMapHandle {
  /** Brings a restaurant's pin into view (the diner moved to its card). */
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
  /** Height covered by the floating cards at the bottom. */
  bottomInset: number;
}

/**
 * Google map of the results (Reparto: PROVIDER_GOOGLE, custom markers that stop tracking view changes once drawn).
 * No `mapPadding`: react-native-maps 1.27 crashes on Android when it arrives before the map is ready; the
 * room for the cards comes from `edgePadding` when fitting the pins.
 * Pins use the availability shape and color; the selected one grows with the orange border.
 */
export function ResultsMap({ ref, restaurants, selectedId, onSelect, center, radiusKm, userLocation, bottomInset }: ResultsMapProps) {
  const { colors, scheme } = useTheme();
  const map = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const mapStyle = useMemo(() => getMapStyle(colors), [colors]);
  // Only read when the map mounts.
  const [initialRegion] = useState(() => getRegion(center, radiusKm));

  // New results (or a new position of the diner): show all of them at once. Selecting a card does not refit.
  const fitKey = [...restaurants.map((restaurant) => restaurant.id), userLocation ? `${userLocation.latitude},${userLocation.longitude}` : ''].join('|');
  const fitResults = useEffectEvent(() => {
    const points = [...restaurants, ...(userLocation ? [userLocation] : [])].map(({ latitude, longitude }) => ({ latitude, longitude }));
    if (points.length < 2) {
      map.current?.animateToRegion(getRegion(points[0] ?? center, radiusKm), CAMERA_MS);
      return;
    }
    map.current?.fitToCoordinates(points, {
      edgePadding: { top: FIT_PADDING, right: FIT_PADDING, bottom: bottomInset + FIT_PADDING, left: FIT_PADDING },
      animated: true,
    });
  });
  useEffect(() => {
    if (ready) fitResults();
  }, [ready, fitKey, bottomInset]);

  useImperativeHandle(ref, () => ({
    focus: ({ latitude, longitude }) => map.current?.animateCamera({ center: { latitude, longitude } }, { duration: CAMERA_MS }),
  }));

  return (
    <MapView
      ref={map}
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      customMapStyle={mapStyle}
      onMapReady={() => setReady(true)}
      moveOnMarkerPress={false}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
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
  );
}

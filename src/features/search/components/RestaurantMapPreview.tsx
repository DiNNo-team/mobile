import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { AvailabilityMarker } from '@/components/ui';
import { env } from '@/config/env';
import { useTheme } from '@/theme/ThemeProvider';

import { getMapStyle } from '../map';
import type { RestaurantDetail } from '../types';

/** About two blocks around the restaurant. */
const DELTA = 0.006;

/**
 * Where the restaurant is, at a glance (manual 13.11): a still map with its pin at the top of the detail. Android draws
 * it in lite mode (a single image, cheap on mid-range phones); it does not take gestures, "Cómo llegar" opens the real
 * map. Without the Maps key the detail simply skips it.
 */
export function RestaurantMapPreview({ restaurant }: { restaurant: RestaurantDetail }) {
  const { colors, scheme } = useTheme();
  const mapStyle = useMemo(() => getMapStyle(colors), [colors]);
  if (!env.mapsEnabled) return null;

  const coordinate = { latitude: restaurant.latitude, longitude: restaurant.longitude };
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-44 overflow-hidden rounded-card border border-line"
    >
      <MapView
        // A new key redraws the still image when the theme changes.
        key={scheme}
        provider={PROVIDER_GOOGLE}
        liteMode
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...coordinate, latitudeDelta: DELTA, longitudeDelta: DELTA }}
        customMapStyle={mapStyle}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={coordinate} tracksViewChanges={false}>
          <AvailabilityMarker availability={restaurant.availability} selected />
        </Marker>
      </MapView>
    </View>
  );
}

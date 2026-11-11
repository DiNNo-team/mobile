import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { EdgeFade, LitDot } from '@/components/ui';
import { env } from '@/config/env';
import { useTheme } from '@/theme/ThemeProvider';

import { getMapStyle, MAP_PITCH } from '../map';
import type { RestaurantDetail } from '../types';

/** Height of the map at the top of the detail; the content starts over its faded lower part. */
export const DETAIL_MAP_HEIGHT = 360;
const ZOOM = 16.3;

/**
 * Where the restaurant is, at a glance (mobile v3): the leaning map at the top of the detail, melting into the ground,
 * with the restaurant as a light in the middle. It does not take gestures: «Cómo llegar» opens the real map. Without
 * the Maps key the detail simply shows the ground.
 */
export function RestaurantMapPreview({ restaurant }: { restaurant: RestaurantDetail }) {
  const { colors, scheme } = useTheme();
  const mapStyle = useMemo(() => getMapStyle(colors), [colors]);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: DETAIL_MAP_HEIGHT }}
    >
      {env.mapsEnabled ? (
        <>
          <MapView
            // A new key draws the map again when the theme changes.
            key={scheme}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialCamera={{
              center: { latitude: restaurant.latitude, longitude: restaurant.longitude },
              zoom: ZOOM,
              pitch: MAP_PITCH,
              heading: 0,
              altitude: 0,
            }}
            customMapStyle={mapStyle}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
            showsBuildings={false}
            showsIndoors={false}
          />
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <LitDot availability={restaurant.availability} />
          </View>
        </>
      ) : null}
      <EdgeFade color={colors.bg} height={150} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
      <EdgeFade color={colors.bg} height={190} direction="up" solidAt={0.78} style={{ position: 'absolute', top: 170, left: 0, right: 0 }} />
    </View>
  );
}

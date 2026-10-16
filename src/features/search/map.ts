import type { MapStyleElement, Region } from 'react-native-maps';

import type { ThemeColors } from '@/theme/tokens';

import type { Coordinates } from './types';

const KM_PER_DEGREE = 111;
/** The visible area shows the whole radius with a margin. */
const REGION_MARGIN = 1.2;

/** Area that shows `radiusKm` around `center`. */
export function getRegion(center: Coordinates, radiusKm: number): Region {
  const delta = (radiusKm * 2 * REGION_MARGIN) / KM_PER_DEGREE;
  return { latitude: center.latitude, longitude: center.longitude, latitudeDelta: delta, longitudeDelta: delta };
}

/**
 * Map with the manual's colors (16.3: map-ground, map-block, map-park, map-water, map-avenue) in light and dark.
 * Business and transit labels are hidden so the DiNNo pins are the only points that stand out.
 */
export function getMapStyle(colors: ThemeColors): MapStyleElement[] {
  return [
    { elementType: 'geometry', stylers: [{ color: colors.mapGround }] },
    { elementType: 'labels.text.fill', stylers: [{ color: colors.text2 }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: colors.bg }] },
    { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: colors.mapBlock }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: colors.mapPark }] },
    { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: colors.mapBlock }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: colors.mapAvenue }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: colors.mapAvenue }] },
    { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: colors.mapWater }] },
  ];
}

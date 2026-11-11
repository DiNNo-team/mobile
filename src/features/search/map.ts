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

/** Mobile v3: the camera leans like the design's map (rotateX ≈ 50°); Google caps the tilt by zoom level. */
export const MAP_PITCH = 60;
/** Street-level zoom when the diner picks a restaurant («el mapa se acerca»). */
export const FOCUS_ZOOM = 16;
/** Explorar never opens further than this: the design's map is close, a few blocks around the chosen restaurant. */
export const EXPLORE_MIN_ZOOM = 16;
/** «Cámara: al elegir restaurante, el mapa gira y se acerca en 600 ms». */
export const FOCUS_MS = 600;

const TILE = 256;
const MAX_ZOOM = 17;

/**
 * Center and zoom that fit `points` in a `width` × `height` map with `padding` on each side. Computed here instead of
 * `fitToCoordinates` because Google resets the tilt to 0 after fitting bounds, and the design keeps it leaning.
 */
export function getFitCamera(
  points: Coordinates[],
  size: { width: number; height: number },
  padding: { top: number; right: number; bottom: number; left: number },
): { center: Coordinates; zoom: number } {
  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);
  const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const usableWidth = Math.max(1, size.width - padding.left - padding.right);
  const usableHeight = Math.max(1, size.height - padding.top - padding.bottom);
  const lngFraction = Math.max((east - west) / 360, 1e-6);
  const latFraction = Math.max((mercator(north) - mercator(south)) / (2 * Math.PI), 1e-6);
  const zoom = Math.min(MAX_ZOOM, Math.log2(usableWidth / TILE / lngFraction), Math.log2(usableHeight / TILE / latFraction));
  // Shift the center so the padded area, not the whole map, is centered on the points.
  const degreesPerPixel = 360 / (TILE * 2 ** zoom);
  const center = {
    latitude: (north + south) / 2 - ((padding.bottom - padding.top) / 2) * degreesPerPixel * Math.cos((((north + south) / 2) * Math.PI) / 180),
    longitude: (east + west) / 2 + ((padding.right - padding.left) / 2) * degreesPerPixel,
  };
  return { center, zoom };
}

/**
 * Map with the mobile v3 palette: the night map in dark (Petróleo blocks, streets as faint light, the tables as the
 * lights) and paper tones in light. Business and transit labels are hidden so the DiNNo pins are the only points that
 * stand out; neighborhood names stay, quiet.
 */
export function getMapStyle(colors: ThemeColors): MapStyleElement[] {
  return [
    { elementType: 'geometry', stylers: [{ color: colors.mapGround }] },
    { elementType: 'labels.text.fill', stylers: [{ color: colors.mapLabel }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: colors.mapFade }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: colors.mapBlock }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: colors.mapPark }] },
    { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: colors.mapRoad }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: colors.mapRoadEdge }] },
    { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: colors.mapAvenue }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: colors.mapAvenue }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: colors.mapWater }] },
  ];
}

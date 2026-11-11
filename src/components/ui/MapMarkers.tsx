import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Availability } from '@/features/search/types';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, themes, type } from '@/theme/tokens';

import { getAvailabilityPresentation, type StatusColor } from './status';
import { StatusShape } from './StatusShape';
import { Text } from './Text';

/**
 * Mobile v3 (diseño definitivo): the tables are lights on the night map. Disponible glows, Pocas mesas glows less and
 * Sin mesas stays off; in light the same pebbles are white with a soft halo of their color. Glows are drawn with SVG
 * gradients (not shadows) so Google Maps keeps them when it turns the marker into an image.
 */
const GLOW: Record<StatusColor, { halo: number; glow: number; size: number }> = {
  ok: { halo: 0.14, glow: 0.42, size: 32 },
  limited: { halo: 0.12, glow: 0.3, size: 38 },
  busy: { halo: 0, glow: 0, size: 32 },
  inactive: { halo: 0, glow: 0, size: 32 },
};
/** Room around the pebble for its glow. */
const GLOW_PAD = 16;

function useStatusColors(color: StatusColor) {
  const { colors, scheme } = useTheme();
  const dark = scheme === 'dark';
  // «Sin mesas» and «Cerrado» are off: a dim edge, no light.
  const edge = color === 'busy' ? (dark ? colors.edgeBusy : colors.borderStrong) : colors[color];
  return { colors, dark, fill: colors[color], edge };
}

export interface AvailabilityMarkerProps {
  availability: Availability;
}

/** Map pin of a restaurant: the availability shape inside a pebble with its light (manual 0.3 and 8, mobile v3). */
export function AvailabilityMarker({ availability }: AvailabilityMarkerProps) {
  const status = getAvailabilityPresentation(availability);
  const { colors, dark, fill, edge } = useStatusColors(status.color);
  const { halo, glow, size } = GLOW[status.color];
  const box = size + GLOW_PAD * 2;
  const c = box / 2;
  const ringOpacity = dark ? halo : halo > 0 ? halo + 0.02 : 0;

  return (
    <View accessible accessibilityLabel={status.label} style={{ width: box, height: box }} className="items-center justify-center">
      <Svg width={box} height={box} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id={`glow-${status.color}`} cx={c} cy={c} r={c} gradientUnits="userSpaceOnUse">
            <Stop offset={0.4} stopColor={fill} stopOpacity={dark ? glow : 0} />
            <Stop offset={1} stopColor={fill} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="drop" cx={c} cy={c + 5} r={size / 2 + 8} gradientUnits="userSpaceOnUse">
            <Stop offset={0.6} stopColor={colors.text} stopOpacity={dark ? 0 : 0.22} />
            <Stop offset={1} stopColor={colors.text} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {glow > 0 ? <Rect width={box} height={box} fill={`url(#glow-${status.color})`} /> : null}
        {!dark ? <Circle cx={c} cy={c + 5} r={size / 2 + 8} fill="url(#drop)" /> : null}
        {ringOpacity > 0 ? <Circle cx={c} cy={c} r={size / 2 + 2.5} fill="none" stroke={fill} strokeOpacity={ringOpacity} strokeWidth={5} /> : null}
        <Circle cx={c} cy={c} r={size / 2 - 0.75} fill={colors.markerBg} stroke={edge} strokeWidth={1.5} />
      </Svg>
      <StatusShape shape={status.shape} color={status.color} size={status.shape === 'diamond' ? 16 : 11} />
    </View>
  );
}

export interface SelectedMarkerProps {
  name: string;
  availability: Availability;
}

/** Height of the label + stem above the dot, and the dot itself: the map anchors the marker at the dot. */
export const SELECTED_MARKER = { width: 220, labelHeight: 40, stem: 30, dot: 18 } as const;

/**
 * The chosen restaurant rises on a stem with its name: a pill (cream in dark, ink in light), a stem fading into orange
 * and the lit dot with the orange selection ring underneath.
 */
export function SelectedMarker({ name, availability }: SelectedMarkerProps) {
  const status = getAvailabilityPresentation(availability);
  const { colors, dark, fill } = useStatusColors(status.color);
  // The pill has the opposite ground, so its dot uses the other scheme's state color.
  const pillDot = themes[dark ? 'light' : 'dark'][status.color];
  const { labelHeight, stem, dot } = SELECTED_MARKER;
  const glowBox = dot + GLOW_PAD * 2;

  return (
    <View
      accessible
      accessibilityLabel={`${name}, ${status.label}, seleccionado`}
      style={{ width: SELECTED_MARKER.width, height: labelHeight + stem + dot + GLOW_PAD }}
      className="items-center"
    >
      <View
        className="flex-row items-center gap-2 rounded-input pl-3 pr-3.5"
        style={{ height: labelHeight, maxWidth: SELECTED_MARKER.width, backgroundColor: colors.markerSelectedBg }}
      >
        <View className="h-2.5 w-2.5 rounded-chip" style={{ backgroundColor: pillDot }} />
        <Text variant="strong" numberOfLines={1} style={{ color: colors.markerSelectedText, flexShrink: 1, fontFamily: type.display.fontFamily }}>
          {name}
        </Text>
      </View>
      <Svg width={2} height={stem}>
        <Defs>
          <LinearGradient id="stem" x1={0} y1={0} x2={0} y2={1}>
            <Stop offset={0} stopColor={colors.markerSelectedBg} />
            <Stop offset={1} stopColor={colors.accent} />
          </LinearGradient>
        </Defs>
        <Rect width={2} height={stem} fill="url(#stem)" />
      </Svg>
      <View style={{ width: glowBox, height: glowBox, marginTop: -2 - GLOW_PAD }} className="items-center justify-center">
        <Svg width={glowBox} height={glowBox} style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="lit" cx={glowBox / 2} cy={glowBox / 2} r={glowBox / 2} gradientUnits="userSpaceOnUse">
              <Stop offset={0.3} stopColor={fill} stopOpacity={dark ? 0.55 : 0.25} />
              <Stop offset={1} stopColor={fill} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={glowBox} height={glowBox} fill="url(#lit)" />
          <Circle cx={glowBox / 2} cy={glowBox / 2} r={dot / 2 - 1.5} fill={fill} stroke={colors.accent} strokeWidth={dark ? 2 : 3} />
        </Svg>
      </View>
    </View>
  );
}

const WAVE_MS = 1500;

/**
 * The diner's position: the orange dot with a radar wave (decision of 15 oct; mobile v3 timing, 1.5 s, ×3.4). With
 * reduced motion it shows a still halo instead.
 */
export function UserLocationMarker() {
  const reduceMotion = useReducedMotion();
  const { colors, scheme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(withTiming(1, { duration: WAVE_MS, easing: Easing.bezier(...motion.enter) }), -1, false);
    return () => cancelAnimation(progress);
  }, [reduceMotion, progress]);

  const wave = useAnimatedStyle(() => ({
    opacity: (scheme === 'dark' ? 0.5 : 0.4) * (1 - progress.value),
    transform: [{ scale: 1 + 2.4 * progress.value }],
  }));

  return (
    <View accessible accessibilityLabel="Tu ubicación" className="h-14 w-14 items-center justify-center">
      {reduceMotion ? (
        <View className="absolute h-9 w-9 rounded-chip bg-accent/20" />
      ) : (
        <Animated.View className="absolute h-4 w-4 rounded-chip bg-accent" style={wave} />
      )}
      <View
        className="h-4 w-4 rounded-chip bg-accent"
        style={{ borderWidth: scheme === 'dark' ? 2.5 : 3, borderColor: colors.userDotBorder, boxShadow: scheme === 'dark' ? undefined : '0 3px 8px rgba(16,37,43,.3)' }}
      />
    </View>
  );
}

/**
 * The restaurant on the detail's map (not a map marker: a view over the still map). It breathes softly: the halo of
 * the light grows and fades every 1.6 s; with reduced motion it is still.
 */
export function LitDot({ availability }: { availability: Availability }) {
  const status = getAvailabilityPresentation(availability);
  const { colors, dark, fill } = useStatusColors(status.color);
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.bezier(...motion.enter) }), -1, false);
    return () => cancelAnimation(pulse);
  }, [reduceMotion, pulse]);

  const halo = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - pulse.value), transform: [{ scale: 1 + 1.1 * pulse.value }] }));
  const size = dark ? 18 : 22;

  return (
    <View
      accessible
      accessibilityLabel="El restaurante en el mapa"
      className="h-20 w-20 items-center justify-center"
    >
      {dark ? (
        <Svg width={80} height={80} style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="detail-lit" cx={40} cy={40} r={40} gradientUnits="userSpaceOnUse">
              <Stop offset={0.2} stopColor={fill} stopOpacity={0.55} />
              <Stop offset={1} stopColor={fill} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={80} height={80} fill="url(#detail-lit)" />
        </Svg>
      ) : null}
      {reduceMotion ? null : <Animated.View className="absolute rounded-chip" style={[{ width: size, height: size, backgroundColor: fill }, halo]} />}
      <View
        className="rounded-chip"
        style={{ width: size, height: size, backgroundColor: fill, borderWidth: dark ? 2 : 3, borderColor: colors.accent }}
      />
    </View>
  );
}

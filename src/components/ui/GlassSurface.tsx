import { BlurView } from 'expo-blur';
import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';

export type GlassLevel = 'map' | 'panel' | 'login';

/** Blur intensity per level (manual 7.1): the login glass is the strongest, like the web card. */
const INTENSITY: Record<GlassLevel, number> = { map: 40, panel: 50, login: 70 };

export interface GlassSurfaceProps {
  children?: ReactNode;
  /** `map`: over the map · `panel`: floating panels · `login`: the sign-in card over the brand shapes. */
  level?: GlassLevel;
  /**
   * Android only blurs what is inside a `BlurTargetView`: pass its ref. Without it (or over the Google map, whose
   * native surface cannot be captured) Android uses the solid fallback.
   */
  blurTarget?: RefObject<View | null>;
  /** Shape and padding (radius, padding). The glass clips to it. */
  className?: string;
  style?: StyleProp<ViewStyle>;
}

function useReduceTransparency(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((value) => active && setReduce(value))
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduce);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

/**
 * Glass of the floating layer (manual 7). Real blur where the platform can do it cheaply:
 * - iOS: always.
 * - Android 12+: with `blurTarget`; older versions fall back on their own (`dimezisBlurViewSdk31Plus`).
 * Solid fallback (92% surface + floating shadow) with "Reduce transparency", over the map on Android, or without a
 * target. Text on it is always ink or cream (manual 7.3). The blur never animates: only what is inside does.
 */
export function GlassSurface({ children, level = 'panel', blurTarget, className, style }: GlassSurfaceProps) {
  const { colors, scheme } = useTheme();
  const reduceTransparency = useReduceTransparency();
  const canBlur = !reduceTransparency && (Platform.OS === 'ios' || (Platform.OS === 'android' && !!blurTarget));
  const veil = level === 'map' ? colors.glassBg : colors.glassPanel;

  return (
    <View
      className={cn('overflow-hidden', className)}
      style={[{ borderWidth: 1, borderColor: colors.glassBorder, boxShadow: colors.shadowFloat }, style]}
    >
      {canBlur ? (
        <BlurView
          intensity={INTENSITY[level]}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: canBlur ? veil : colors.glassSolid }]} />
      {children}
    </View>
  );
}

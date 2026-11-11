import { X } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';

import { IconButton } from './IconButton';
import { Text } from './Text';
import { usePresence } from './use-presence';

/** Dragging further than this, or flicking down faster, closes the sheet. */
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;
/** Dragging up past the top moves the sheet a fifth of the finger: friction, not a wall (manual 11.3). */
const OVERDRAG = 0.2;
const MAX_HEIGHT_RATIO = 0.85;

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Fixed actions at the bottom: e.g. "Limpiar filtros" (ghost) + "Ver restaurantes" (primary, full width). */
  footer?: ReactNode;
  /**
   * `solid` (default, manual 12.2) or `glass` (mobile v3, like the dashboard's `glass-sheet`): the room light inside the
   * sheet, the glass edge and sheen, a big title with a small `kicker` above it and a footer without a divider. The sheet
   * opens in its own window, so nothing behind it can be blurred on Android: the glass is light + translucent cards.
   */
  variant?: 'solid' | 'glass';
  /** Glass only: a small line above the title («Reservar mesa» over the restaurant's name). */
  kicker?: string;
}

/** The two room lights inside the glass sheet, drawn at the sheet's own size. */
function SheetGlow({ width, height }: { width: number; height: number }) {
  const { colors } = useTheme();
  if (width === 0 || height === 0) return null;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="sheet-warm" gradientUnits="userSpaceOnUse" cx={0} cy={0} fx={0} fy={0} rx={width * 1.1} ry={height * 0.75}>
          <Stop offset={0} stopColor={colors.ambWarm} stopOpacity={colors.glowWarmOpacity} />
          <Stop offset={0.72} stopColor={colors.ambWarm} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="sheet-cool" gradientUnits="userSpaceOnUse" cx={width} cy={height} fx={width} fy={height} rx={width * 1.1} ry={height * 0.8}>
          <Stop offset={0} stopColor={colors.glowCool} stopOpacity={colors.glowCoolOpacity} />
          <Stop offset={0.72} stopColor={colors.glowCool} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#sheet-warm)" />
      <Rect width={width} height={height} fill="url(#sheet-cool)" />
    </Svg>
  );
}

/**
 * Bottom sheet (manual 12.2): radius 28 on top, handle, title with close button. Closes with the back button, a tap
 * on the overlay, or dragging the handle down (by distance or by a flick). Dragging up meets friction, and it settles
 * with a spring that keeps the gesture's velocity. Content scrolls; the footer stays fixed.
 */
export function BottomSheet({ visible, onClose, title, children, footer, variant = 'solid', kicker }: BottomSheetProps) {
  const glass = variant === 'glass';
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { mounted, progress } = usePresence(visible);
  const drag = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((event) => {
      drag.value = event.translationY > 0 ? event.translationY : event.translationY * OVERDRAG;
    })
    .onEnd((event) => {
      if (event.translationY > CLOSE_DISTANCE || event.velocityY > CLOSE_VELOCITY) {
        scheduleOnRN(onClose);
      }
      // Back into place with a spring that keeps the finger's velocity (none with reduced motion).
      drag.value = reduceMotion
        ? withTiming(0, { duration: 0 })
        : withSpring(0, { ...motion.spring.snappy, velocity: event.velocityY });
    });

  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [height, 0]) + drag.value }],
  }));

  return (
    <Modal visible={mounted} transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, overlayStyle]}>
          <Pressable accessibilityLabel="Cerrar" className="flex-1" onPress={onClose} />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          className={cn('overflow-hidden', glass ? 'rounded-t-ticket bg-bg' : 'rounded-t-sheet bg-surface')}
          onLayout={glass ? (event) => setSize(event.nativeEvent.layout) : undefined}
          style={[
            {
              maxHeight: height * MAX_HEIGHT_RATIO,
              paddingBottom: insets.bottom + 16,
              boxShadow: glass ? `${colors.glassSheen}, ${colors.shadowFloat}` : colors.shadowFloat,
            },
            glass ? { borderWidth: 1, borderBottomWidth: 0, borderColor: colors.glassEdge } : null,
            sheetStyle,
          ]}
        >
          {glass ? <SheetGlow width={size.width} height={size.height} /> : null}
          <GestureDetector gesture={pan}>
            <View className={glass ? 'px-5 pb-3 pt-3' : 'px-4 pb-2 pt-3'}>
              <View className="mb-2 h-1 w-10 self-center rounded-chip bg-line-strong" />
              {glass ? (
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1 pt-1">
                    {kicker ? (
                      <Text variant="strong" tone="caption">
                        {kicker}
                      </Text>
                    ) : null}
                    <Text variant="page" accessibilityRole="header" numberOfLines={2}>
                      {title}
                    </Text>
                  </View>
                  <IconButton variant="raised" icon={X} accessibilityLabel="Cerrar" onPress={onClose} />
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text variant="h3" accessibilityRole="header">
                    {title}
                  </Text>
                  <IconButton icon={X} accessibilityLabel="Cerrar" onPress={onClose} className="-mr-2" />
                </View>
              )}
            </View>
          </GestureDetector>
          <ScrollView className={glass ? 'px-5' : 'px-4'} contentContainerClassName={glass ? 'gap-3 pb-4 pt-1' : 'gap-6 pb-4'}>
            {children}
          </ScrollView>
          {footer ? <View className={glass ? 'gap-2 px-5 pt-3' : 'gap-2 border-t border-line px-4 pt-4'}>{footer}</View> : null}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
}

/**
 * Bottom sheet (manual 12.2): radius 28 on top, handle, title with close button. Closes with the back button, a tap
 * on the overlay, or dragging the handle down (by distance or by a flick). Dragging up meets friction, and it settles
 * with a spring that keeps the gesture's velocity. Content scrolls; the footer stays fixed.
 */
export function BottomSheet({ visible, onClose, title, children, footer }: BottomSheetProps) {
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
          className="rounded-t-sheet bg-surface"
          style={[{ maxHeight: height * MAX_HEIGHT_RATIO, paddingBottom: insets.bottom + 16, boxShadow: colors.shadowFloat }, sheetStyle]}
        >
          <GestureDetector gesture={pan}>
            <View className="px-4 pb-2 pt-3">
              <View className="mb-2 h-1 w-10 self-center rounded-chip bg-line-strong" />
              <View className="flex-row items-center justify-between">
                <Text variant="h3" accessibilityRole="header">
                  {title}
                </Text>
                <IconButton icon={X} accessibilityLabel="Cerrar" onPress={onClose} className="-mr-2" />
              </View>
            </View>
          </GestureDetector>
          <ScrollView className="px-4" contentContainerClassName="gap-6 pb-4">
            {children}
          </ScrollView>
          {footer ? <View className="gap-2 border-t border-line px-4 pt-4">{footer}</View> : null}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

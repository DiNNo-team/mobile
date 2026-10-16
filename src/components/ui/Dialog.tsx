import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';
import { usePresence } from './use-presence';

const RISE = 8;

export interface DialogProps {
  visible: boolean;
  /** Back button and tap outside call it, unless `busy`. */
  onClose: () => void;
  /** Short question (manual 11.3): "¿Cerrar sesión?". */
  title: string;
  /** The consequence: "Tendrás que iniciar sesión de nuevo para buscar mesa." */
  description?: string;
  children?: ReactNode;
  /** Buttons, main one first; on mobile they go stacked and full width (`fullWidth`). */
  actions: ReactNode;
  /** While the action runs the dialog cannot be dismissed. */
  busy?: boolean;
}

/** Confirmation modal (manual 9 and 11.3): radius 20, padding 24, overlay, solid (no glass). */
export function Dialog({ visible, onClose, title, description, children, actions, busy = false }: DialogProps) {
  const { colors } = useTheme();
  const { mounted, progress } = usePresence(visible);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [RISE, 0]) }],
  }));

  const dismiss = () => {
    if (!busy) onClose();
  };

  return (
    <Modal visible={mounted} transparent statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={dismiss}>
      <View className="flex-1 items-center justify-center px-4">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, overlayStyle]}>
          <Pressable accessibilityLabel="Cerrar" className="flex-1" onPress={dismiss} />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          className="w-full max-w-dialog gap-5 rounded-card bg-surface p-6"
          style={[{ boxShadow: colors.shadowFloat }, cardStyle]}
        >
          <View className="gap-2">
            <Text variant="h3" accessibilityRole="header">
              {title}
            </Text>
            {description ? (
              <Text variant="body" tone="secondary">
                {description}
              </Text>
            ) : null}
          </View>
          {children}
          <View className="gap-2">{actions}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

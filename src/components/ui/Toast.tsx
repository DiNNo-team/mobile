import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';

import { FEEDBACK, type FeedbackType } from './Alert';
import { Icon } from './Icon';
import { Text } from './Text';
import { usePresence } from './use-presence';

/** Manual 11.1: 4 s; 6 s when it offers an action like "Deshacer". */
const DURATION_MS = 4000;
const DURATION_WITH_ACTION_MS = 6000;
/** Over the tab bar (manual 11.2: bottom center, above the bottom bar). */
const TAB_BAR_CLEARANCE = 72;
const RISE = 16;

export interface ToastOptions {
  type: FeedbackType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  /** Shows a toast; a new one replaces the current one (only one at a time). */
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastView({ toast, visible, onHide }: { toast: ToastOptions | null; visible: boolean; onHide: () => void }) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { mounted, progress } = usePresence(visible, motion.base);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [RISE, 0]) }],
  }));

  if (!mounted || !toast) return null;
  const feedback = FEEDBACK[toast.type];

  return (
    <Animated.View
      pointerEvents="box-none"
      className="absolute left-4 right-4 items-center"
      style={[{ bottom: insets.bottom + TAB_BAR_CLEARANCE }, style]}
    >
      <View
        accessibilityLiveRegion={toast.type === 'error' ? 'assertive' : 'polite'}
        accessibilityRole={toast.type === 'error' ? 'alert' : undefined}
        className="w-full max-w-toast flex-row items-center gap-3 rounded-btn bg-inverse py-3 pl-4 pr-2"
        style={{ boxShadow: colors.shadowFloat }}
      >
        {/* The toast background is inverted, so the state color comes from the opposite scheme to stay readable. */}
        <Icon icon={feedback.icon} color={feedback.color} scheme={scheme === 'light' ? 'dark' : 'light'} />
        <Text variant="sec" tone="onInverse" className="flex-1 py-1">
          {toast.message}
        </Text>
        {toast.actionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              toast.onAction?.();
              onHide();
            }}
            className="min-h-11 justify-center rounded-input px-3"
          >
            <Text variant="button" tone="inverseAccent">
              {toast.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** Mounted once at the root; screens call `useToast().showToast(...)`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(options);
      setVisible(true);
      timer.current = setTimeout(hideToast, options.actionLabel ? DURATION_WITH_ACTION_MS : DURATION_MS);
    },
    [hideToast],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastView toast={toast} visible={visible} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

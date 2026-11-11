import { useFocusEffect } from 'expo-router';
import { UserRoundCheck, UserRoundPlus, type LucideIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui';
import { selectionHaptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';

export type AuthTab = 'signin' | 'signup';

// Same icons as the web login tabs (`auth-view.ts`).
const TABS: { tab: AuthTab; label: string; icon: LucideIcon }[] = [
  { tab: 'signin', label: 'Iniciar sesión', icon: UserRoundCheck },
  { tab: 'signup', label: 'Crear cuenta', icon: UserRoundPlus },
];

const move = Easing.bezier(...motion.move);

export interface AuthTabsProps {
  active: AuthTab;
  /** Called once the orange bar reached the other tab (right away with reduced motion). */
  onSelect: (tab: AuthTab) => void;
}

/**
 * "Iniciar sesión / Crear cuenta" (manual 13.9), the web login's tabs on a phone: two tabs in a row, each with the web's
 * icon, and the orange bar that slides to the chosen one (300 ms, `--ease-move`) before the other screen opens, with
 * a selection tick.
 */
export function AuthTabs({ active, onSelect }: AuthTabsProps) {
  const reduceMotion = useReducedMotion();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const position = useSharedValue(active === 'signin' ? 0 : 1);

  // Coming back to this screen (Android back, "Inicia sesión"), the bar returns under its own tab.
  useFocusEffect(
    useCallback(() => {
      position.set(active === 'signin' ? 0 : 1);
    }, [active, position]),
  );

  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateX: position.value * (width / 2) }] }));

  const choose = (tab: AuthTab) => {
    if (tab === active) return;
    selectionHaptic();
    const target = tab === 'signin' ? 0 : 1;
    if (reduceMotion) {
      position.set(target);
      onSelect(tab);
      return;
    }
    position.set(
      withTiming(target, { duration: motion.slow, easing: move }, (finished) => {
        if (finished) scheduleOnRN(onSelect, tab);
      }),
    );
  };

  return (
    <View accessibilityRole="tablist" onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      <View className="flex-row">
        {TABS.map(({ tab, label, icon: Icon }) => {
          const selected = tab === active;
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => choose(tab)}
              className="min-h-12 flex-1 flex-row items-center justify-center gap-2"
            >
              <Icon size={18} strokeWidth={2} color={selected ? colors.accentText : colors.text2} aria-hidden />
              <Text variant={selected ? 'button' : 'sec'}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="h-1 bg-line">
        {width > 0 ? <Animated.View className="h-1 rounded-chip bg-accent" style={[{ width: width / 2 }, barStyle]} /> : null}
      </View>
    </View>
  );
}

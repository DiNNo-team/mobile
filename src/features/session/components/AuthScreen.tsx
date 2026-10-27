import { BlurTargetView } from 'expo-blur';
import { useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface, Logo } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';

import { AuthTabs, type AuthTab } from './AuthTabs';

export interface AuthScreenProps {
  children: ReactNode;
  /** `center`: card in the middle of the screen (messages); `top`: forms. */
  align?: 'top' | 'center';
  /** Shows the DiNNo logo at the top of the card. */
  showLogo?: boolean;
  /** "Iniciar sesión / Crear cuenta" tabs at the top of the card (login and sign-up). */
  tabs?: { active: AuthTab; onSelect: (tab: AuthTab) => void };
}

const enter = Easing.bezier(...motion.sheet);

/** The two brand shapes in opposite corners (manual 13.9), as on the web login. Static: they never animate. */
function BrandShapes() {
  const { colors, scheme } = useTheme();
  const { width } = useWindowDimensions();
  const size = width * 1.15;
  return (
    <>
      <View
        style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, top: -size * 0.62, left: -size * 0.42, backgroundColor: colors.accent }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          bottom: -size * 0.66,
          right: -size * 0.4,
          // On dark the petrol shape would vanish into the ground: it takes the lighter petrol of the surfaces.
          backgroundColor: scheme === 'dark' ? colors.surface2 : colors.brand,
        }}
      />
    </>
  );
}

/**
 * Frame of the screens without a diner session (manual 13.9): the web login's world on a phone. Cream ground with the
 * two brand shapes, and the form on a glass card that rises in (300 ms; just appears with reduced motion).
 *
 * Performance on mid-range phones: one blur per screen, over a static target (the shapes, not the form), with
 * `dimezisBlurViewSdk31Plus` (Android 11 and older get the solid fallback). "Reduce transparency" also turns it solid.
 */
export function AuthScreen({ children, align = 'top', showLogo = true, tabs }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const target = useRef<View>(null);

  return (
    <View className="flex-1 bg-bg">
      <BlurTargetView ref={target} style={StyleSheet.absoluteFill} pointerEvents="none">
        <View className="flex-1 bg-bg">
          <BrandShapes />
        </View>
      </BlurTargetView>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={cn('grow px-4', align === 'center' && 'justify-center')}
          contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }}
        >
          <Animated.View entering={FadeInDown.duration(motion.slow).easing(enter)} className="w-full max-w-toast self-center">
            <GlassSurface level="login" blurTarget={target} className="rounded-card">
              {tabs ? <AuthTabs active={tabs.active} onSelect={tabs.onSelect} /> : null}
              <View className="gap-6 p-6">
                {showLogo ? <Logo width={112} /> : null}
                {children}
              </View>
            </GlassSurface>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

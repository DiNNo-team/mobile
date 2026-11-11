import { BlurTargetView } from 'expo-blur';
import { useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGround } from '@/components/AmbientGround';
import { GlassSurface, Logo } from '@/components/ui';
import { cn } from '@/lib/cn';
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

/**
 * Frame of the screens without a diner session (manual 13.9): the web login's world on a phone. The room light of the
 * dashboard (`AmbientGround`), and the form on a glass card that rises in (300 ms; just appears with reduced motion).
 *
 * Performance on mid-range phones: one blur per screen, over a static target (the light, not the form), with
 * `dimezisBlurViewSdk31Plus` (Android 11 and older get the solid fallback). "Reduce transparency" also turns it solid.
 */
export function AuthScreen({ children, align = 'top', showLogo = true, tabs }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const target = useRef<View>(null);

  return (
    <View className="flex-1 bg-bg">
      <BlurTargetView ref={target} style={StyleSheet.absoluteFill} pointerEvents="none">
        <AmbientGround />
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

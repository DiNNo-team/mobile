import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface AuthScreenProps {
  children: ReactNode;
  /** `center`: content in the middle of the screen (messages); `top`: forms. */
  align?: 'top' | 'center';
  /** Shows the DiNNo logo on top (manual 12.4 on small screens: light logo, no brand panel). */
  showLogo?: boolean;
}

/** Frame of the screens without a diner session: safe area, keyboard-aware scroll, 16 margins, max width 400. */
export function AuthScreen({ children, align = 'top', showLogo = true }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName={cn('grow px-4', align === 'center' && 'justify-center')}
        contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
      >
        <View className="w-full max-w-toast gap-6 self-center">
          {showLogo ? <Logo width={112} /> : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

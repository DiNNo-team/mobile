import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui';
import { SessionProvider, useAuth } from '@/features/session/SessionProvider';
import { connectQueryLifecycle, queryClient } from '@/lib/query-client';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash may already be hidden after a fast refresh; nothing to do.
});

function RootNavigator() {
  const { scheme, colors, ready } = useTheme();
  const { status } = useAuth();
  const restoring = status === 'restoring';

  useEffect(() => {
    if (ready && !restoring) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, restoring]);

  const navigationTheme = useMemo<Theme>(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accentText,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [scheme, colors]);

  // The navigator always mounts (Expo Router needs it); the splash covers it until the theme and the saved
  // session are read. Each group is only reachable in its session state (the role comes from the backend).
  // Fonts are embedded in the build (expo-font plugin in app.config.ts), so they exist from the first frame.
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={status === 'ready'}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={status !== 'ready'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        {/* Kit catalog: only in development builds. */}
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="kit" />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  // Foreground and network drive the refetches (React Native has no window focus).
  useEffect(() => connectQueryLifecycle(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SessionProvider>
              <ToastProvider>
                <RootNavigator />
              </ToastProvider>
            </SessionProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

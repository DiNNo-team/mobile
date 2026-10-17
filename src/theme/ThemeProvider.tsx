import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { colorScheme as nativeWindColorScheme, useColorScheme, vars } from 'nativewind';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { cssVars } from './css-vars';
import { themes, type ColorScheme, type ThemeColors } from './tokens';

/** What the diner picked in Perfil: follow the phone, or force light or dark. */
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'dinno.theme-preference';
const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

const rootVars = { light: vars(cssVars.light), dark: vars(cssVars.dark) };

interface ThemeContextValue {
  /** The diner's choice. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** The scheme on screen right now (the system's when the preference is `system`). */
  scheme: ColorScheme;
  /** Token values for props that do not take a className (icons, navigation, map). */
  colors: ThemeColors;
  /** False until the saved preference is read; the splash screen stays up meanwhile. */
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

async function readPreference(): Promise<ThemePreference> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return PREFERENCES.find((option) => option === saved) ?? 'system';
  } catch {
    // Storage unavailable: falling back to the system theme is the expected behavior.
    return 'system';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    let active = true;
    readPreference().then((saved) => {
      if (!active) return;
      nativeWindColorScheme.set(saved);
      setPreferenceState(saved);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    nativeWindColorScheme.set(next);
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Not saved: the choice still applies until the app restarts, nothing to tell the diner.
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, setPreference, scheme, colors: themes[scheme], ready }),
    [preference, setPreference, scheme, ready],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={rootVars[scheme]} className="flex-1 bg-bg">
        {children}
      </View>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

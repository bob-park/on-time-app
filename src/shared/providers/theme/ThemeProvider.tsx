import { createContext, useEffect, useMemo, useState } from 'react';

import { useColorScheme } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme as useNativewindColorSchema } from 'nativewind';

const KEY_THEME_PREFERENCE = 'theme.preference';

interface ThemeContextType {
  /** Resolved theme actually displayed — always 'light' or 'dark'. Use this for inline color branches. */
  theme: 'light' | 'dark';
  /** User's saved preference — 'light' | 'dark' | 'system'. Only settings UI should read this. */
  preference: ThemePreference;
  onUpdateTheme: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'system',
  onUpdateTheme: () => {},
});

export default function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state — what the user picked
  const [preference, setPreference] = useState<ThemePreference>('system');

  // hooks
  const { setColorScheme } = useNativewindColorSchema();
  const systemColorScheme = useColorScheme();

  // load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(KEY_THEME_PREFERENCE)
      .then((data) => (data as ThemePreference) || 'system')
      .then((p) => setPreference(p));
  }, []);

  // NativeWind v4 accepts 'light' | 'dark' | 'system' directly
  useEffect(() => {
    setColorScheme(preference);
    AsyncStorage.setItem(KEY_THEME_PREFERENCE, preference);
  }, [preference]);

  // resolve preference → concrete light/dark
  const theme: 'light' | 'dark' =
    preference === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : preference;

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      preference,
      onUpdateTheme: (next: ThemePreference) => setPreference(next),
    }),
    [theme, preference],
  );

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

import { createContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from 'nativewind';

const KEY_THEME_PREFERENCE = 'theme.preference';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: 'dark' | 'light';
  preference: ThemePreference;
  onUpdatePreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'system',
  onUpdatePreference: (preference: ThemePreference) => {},
});

export default function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [preference, setPreference] = useState<ThemePreference>('system');

  // hooks
  const { colorScheme, setColorScheme } = useColorScheme();

  // useEffect
  useEffect(() => {
    AsyncStorage.getItem(KEY_THEME_PREFERENCE)
      .then((data) => (!data ? 'system' : (data as ThemePreference)))
      .then((preference) => setPreference(preference));
  }, []);

  useEffect(() => {
    setColorScheme(preference === 'system' ? 'system' : preference);

    // save
    AsyncStorage.setItem(KEY_THEME_PREFERENCE, preference);
  }, [preference, colorScheme]);

  // memorize
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme: colorScheme || 'light',
      preference,
      onUpdatePreference: (preference: ThemePreference) => {
        setPreference(preference);
      },
    }),
    [colorScheme, preference],
  );

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

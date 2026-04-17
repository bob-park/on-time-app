import { createContext, useEffect, useMemo, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme as useNativewindColorSchema } from 'nativewind';

const KEY_THEME_PREFERENCE = 'theme.preference';

interface ThemeContextType {
  theme: ThemePreference;
  onUpdateTheme: (theme: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  onUpdateTheme: (preference: ThemePreference) => {},
});

export default function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [theme, setTheme] = useState<ThemePreference>('system');

  // hooks
  const { setColorScheme } = useNativewindColorSchema();

  // useEffect
  useEffect(() => {
    AsyncStorage.getItem(KEY_THEME_PREFERENCE)
      .then((data) => (data as ThemePreference) || 'system')
      .then((preference) => setTheme(preference));
  }, []);

  useEffect(() => {
    setColorScheme(theme);

    // save
    AsyncStorage.setItem(KEY_THEME_PREFERENCE, theme);
  }, [theme]);

  // memorize
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme,
      onUpdateTheme: (theme: ThemePreference) => {
        setTheme(theme);
      },
    }),
    [theme],
  );

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

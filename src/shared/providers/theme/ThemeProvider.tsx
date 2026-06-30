import { createContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

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
  const deviceScheme = useDeviceColorScheme();

  // useEffect
  useEffect(() => {
    AsyncStorage.getItem(KEY_THEME_PREFERENCE)
      .then((data) => (data as ThemePreference) || 'system')
      .then((preference) => setTheme(preference));
  }, []);

  useEffect(() => {
    // NW5의 setColorScheme 은 'system' 을 받지 않으므로 디바이스 스킴으로 해석한다.
    setColorScheme(theme === 'system' ? (deviceScheme ?? 'light') : theme);

    // save
    AsyncStorage.setItem(KEY_THEME_PREFERENCE, theme);
  }, [theme, deviceScheme]);

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

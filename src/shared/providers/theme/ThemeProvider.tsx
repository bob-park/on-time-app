import { createContext, useEffect, useMemo } from 'react';

import { useColorScheme as useDeviceColorScheme } from 'react-native';

import { useStore } from '@/shared/store/rootStore';

import { useColorScheme as useNativewindColorSchema } from 'nativewind';

interface ThemeContextType {
  theme: ThemePreference;
  onUpdateTheme: (theme: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  onUpdateTheme: (preference: ThemePreference) => {},
});

export default function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // store
  const themePreference = useStore((state) => state.themePreference);
  const setThemePreference = useStore((state) => state.setThemePreference);

  // hooks
  const { setColorScheme } = useNativewindColorSchema();
  const deviceScheme = useDeviceColorScheme();

  // useEffect
  useEffect(() => {
    // NW5의 setColorScheme 은 'system' 을 받지 않으므로 디바이스 스킴으로 해석한다.
    setColorScheme(themePreference === 'system' ? (deviceScheme ?? 'light') : themePreference);
  }, [themePreference, deviceScheme]);

  // memorize
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      theme: themePreference,
      onUpdateTheme: setThemePreference,
    }),
    [themePreference, setThemePreference],
  );

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

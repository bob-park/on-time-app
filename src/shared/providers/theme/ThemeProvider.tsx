import { createContext, useEffect, useMemo } from 'react';

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

  // useEffect
  useEffect(() => {
    // NW5의 setColorScheme 은 Appearance.setColorScheme 에 위임된다.
    // 'system' 은 OS 를 따라가는 'unspecified' 로 매핑한다(구체 값을 강제하면 시스템 추종이 깨진다).
    setColorScheme(themePreference === 'system' ? 'unspecified' : themePreference);
  }, [themePreference, setColorScheme]);

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

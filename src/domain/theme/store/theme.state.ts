import { ThemePreference } from '@/shared/providers/theme/ThemeProvider';

type ThemeState = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

export type { ThemeState };

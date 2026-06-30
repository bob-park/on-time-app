import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

import { ThemeState } from './theme.state';

const createThemeSlice: SlicePattern<ThemeState, BoundState> = (set) => ({
  themePreference: 'system',
  setThemePreference: (preference) =>
    set(() => ({ themePreference: preference }), false, { type: 'theme/setPreference' }),
});

export default createThemeSlice;

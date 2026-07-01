import AsyncStorage from '@react-native-async-storage/async-storage';

import createNotificationSlice from '@/domain/notification/store/slice';
import { NotificationState } from '@/domain/notification/store/notifications.state';
import createThemeSlice from '@/domain/theme/store/slice';
import { ThemeState } from '@/domain/theme/store/theme.state';
import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';
import { ThemePreference } from '@/shared/providers/theme/ThemeProvider';

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
        ...createThemeSlice(...a),
        ...createNotificationSlice(...a),
      })),
      {
        name: 'on-time-app',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state): { userinfo?: UserInfo; themePreference?: ThemePreference; userProviderId?: string } => ({
          userinfo: state.userinfo,
          themePreference: state.themePreference,
          userProviderId: state.userProviderId,
        }),
      },
    ),
    { name: 'on-time-app', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState & ThemeState & NotificationState;

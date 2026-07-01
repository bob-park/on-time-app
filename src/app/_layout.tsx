import { useContext } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from 'nativewind';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loader/app/AnimateAppLoader';
import AuthProvider, { AuthContext } from '@/shared/providers/auth/AuthProvider';
import I18nProvider from '@/shared/providers/i18n/I18nProvider';
import NotificationProvider from '@/shared/providers/notification/NotificationProvider';
import RQProvider from '@/shared/providers/query/RQProvider';
import ThemeProvider from '@/shared/providers/theme/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

const RootStackLayout = () => {
  // context
  const { isLoggedIn } = useContext(AuthContext);

  // hooks
  const { colorScheme } = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#f7f7f8',
        },
      }}
    >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="callback" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <I18nProvider>
          <RQProvider>
            <AuthProvider>
              <NotificationProvider>
                <AnimateAppLoader>
                  <StatusBar style="auto" animated />
                  <RootStackLayout />
                </AnimateAppLoader>
              </NotificationProvider>
            </AuthProvider>
          </RQProvider>
        </I18nProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loader/app/AnimateAppLoader';
import AuthProvider from '@/shared/providers/auth/AuthProvider';
import NotificationProvider from '@/shared/providers/notification/NotificationProvider';
import RQProvider from '@/shared/providers/query/RQProvider';
import ThemeProvider from '@/shared/providers/theme/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RQProvider>
        <AuthProvider>
          <AnimateAppLoader>
            <NotificationProvider>
              <StatusBar style="auto" animated />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="callback" />
              </Stack>
            </NotificationProvider>
          </AnimateAppLoader>
        </AuthProvider>
      </RQProvider>
    </ThemeProvider>
  );
}

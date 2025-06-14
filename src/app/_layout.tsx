import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loader/app/AnimateAppLoader';
import AuthProvider from '@/shared/providers/auth/AuthProvider';
import RQProvider from '@/shared/providers/query/RQProvider';
import ThemeProvider from '@/shared/providers/theme/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RQProvider>
        <AuthProvider>
          <AnimateAppLoader>
            <StatusBar style="auto" animated />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="callback" options={{ headerShown: false }} />
            </Stack>
          </AnimateAppLoader>
        </AuthProvider>
      </RQProvider>
    </ThemeProvider>
  );
}

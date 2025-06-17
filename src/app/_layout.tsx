import { Text, View } from 'react-native';
import 'react-native-reanimated';
import Toast, { ToastConfig } from 'react-native-toast-message';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loader/app/AnimateAppLoader';
import AuthProvider from '@/shared/providers/auth/AuthProvider';
import NotificationProvider from '@/shared/providers/notification/NotificationProvider';
import RQProvider from '@/shared/providers/query/RQProvider';
import ThemeProvider from '@/shared/providers/theme/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

// custom toast
const toastConfig: ToastConfig = {
  selectedToast: ({ text1, text2 }) => (
    <View className="mt-4 w-full px-5">
      <View
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-[1px] border-gray-100 bg-gray-50 px-8 py-4 dark:border-gray-800 dark:bg-gray-950"
        style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 2, height: 4 } }}
      >
        <View className="w-full">
          <Text className="text-lg font-bold dark:text-white">{text1}</Text>
        </View>
        <View className="w-full">
          <Text className="text-gray-500 dark:text-gray-500">{text2}</Text>
        </View>
      </View>
    </View>
  ),
};

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
              <Toast config={toastConfig} />
            </NotificationProvider>
          </AnimateAppLoader>
        </AuthProvider>
      </RQProvider>
    </ThemeProvider>
  );
}

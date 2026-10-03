import { useContext } from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loader/app/AnimateAppLoader';
import { AuthGuardStack } from '@/shared/navigation/AuthGuardStack';
import AuthProvider, { AuthContext } from '@/shared/providers/auth/AuthProvider';
import I18nProvider from '@/shared/providers/i18n/I18nProvider';
import NotificationProvider from '@/shared/providers/notification/NotificationProvider';
import RQProvider from '@/shared/providers/query/RQProvider';
import ThemeProvider from '@/shared/providers/theme/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

const RootStackLayout = () => {
  // context
  const { isLoggedIn } = useContext(AuthContext);

  return <AuthGuardStack isLoggedIn={isLoggedIn} />;
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

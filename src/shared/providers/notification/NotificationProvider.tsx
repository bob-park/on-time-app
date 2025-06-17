import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Linking } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import { useUserNotification } from '@/domain/notification/queries/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

const KEY_NOTIFICATION_TOKEN = 'notificationToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
  handleSuccess: (notificationId) => {
    console.log('handleSuccess', notificationId);
  },
  handleError: (notificationId, error) => {
    console.log('handleError', notificationId, error);
  },
});

interface NotificationContextType {
  token?: string;
  onSendNotification: ({ title, description }: { title: string; description: string }) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  onSendNotification: ({ title, description }) => {},
});

export default function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // context
  const { user } = useContext(AuthContext);

  // state
  const [token, setToken] = useState<string>();

  // queries
  const { createUserNotification } = useUserNotification({ userUniqueId: user?.uniqueId || '' });

  // useEffect
  useEffect(() => {
    SecureStore.getItemAsync(KEY_NOTIFICATION_TOKEN).then((data) => {
      if (!data) {
        // init
        handleInit();

        return;
      }

      handleUpdateToken(data);
    });
  }, [user]);

  useEffect(() => {
    if (!token) {
      return;
    }

    console.log('notificationToken', token);

    createUserNotification({ type: Device.osName === 'iOS' ? 'IOS' : 'ANDROID', notificationToken: token });

    return () => {};
  }, [token]);

  // handle
  const handleInit = async () => {
    if (Device.osName === 'Android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      return Linking.openSettings();
    }

    if (!Device.isDevice) {
      console.warn('no device');
      // return;
    }

    const projectId = Constants.expoConfig?.extra?.esp?.projectId ?? Constants.easConfig?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    })
      .then((data) => data.data)
      .catch((err) => console.error(err));

    handleUpdateToken(token || '');
  };

  const handleUpdateToken = (token: string) => {
    setToken(token);

    SecureStore.setItemAsync(KEY_NOTIFICATION_TOKEN, token);
  };

  const handleSendNotification = ({ title, description }: { title: string; description: string }) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: description,
      },
      trigger: null,
    });
  };

  // memorize
  const memorizedContextValue = useMemo<NotificationContextType>(
    () => ({ token, onSendNotification: handleSendNotification }),
    [token],
  );

  return <NotificationContext value={memorizedContextValue}>{children}</NotificationContext>;
}

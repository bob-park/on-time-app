import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Linking } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import { useUserNotification } from '@/domain/notification/queries/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { showToast } from '@/utils/toast';

const KEY_USER_PROVIDER_ID = 'userProviderId';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
  handleSuccess: (notificationId) => {},
  handleError: (notificationId, error) => {},
});

interface NotificationContextType {
  userProviderId?: string;
}

export const NotificationContext = createContext<NotificationContextType>({});

export default function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // context
  const { user } = useContext(AuthContext);

  // state
  const [userProviderId, setUserProviderId] = useState<string>();

  // queries
  const { createUserNotification } = useUserNotification(
    { userUniqueId: user?.uniqueId || '' },
    {
      onSuccess: (data) => {
        handleUpdateUserProviderId(data.id);
      },
    },
  );

  // useEffect
  useEffect(() => {
    SecureStore.getItemAsync(KEY_USER_PROVIDER_ID).then((data) => {
      if (!data) {
        // init
        handleInit();

        return;
      }

      handleUpdateUserProviderId(data);
    });

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      showToast({
        title: notification.request.content.title || 'On Time 알리미',
        description: notification.request.content.body || '',
      });
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

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
      return;
    }

    const projectId = Constants.expoConfig?.extra?.esp?.projectId ?? Constants.easConfig?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    })
      .then((data) => data.data)
      .catch((err) => console.error(err));

    createUserNotification({ type: Device.osName === 'iOS' ? 'IOS' : 'ANDROID', notificationToken: token || '' });
  };

  const handleUpdateUserProviderId = (id: string) => {
    setUserProviderId(id);

    SecureStore.setItemAsync(KEY_USER_PROVIDER_ID, id);
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
    () => ({ userProviderId, onSendNotification: handleSendNotification }),
    [userProviderId],
  );

  return <NotificationContext value={memorizedContextValue}>{children}</NotificationContext>;
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Linking, Text, View } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { usePathname, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useNotificationHistories, useUserNotification } from '@/domain/notification/queries/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

const KEY_USER_PROVIDER_ID = 'userProviderId';

// custom toast
const toastConfig: ToastConfig = {
  selectedToast: ({ text1, text2 }) => (
    <View className="mt-4 w-full px-5">
      <View
        className="flex w-full flex-col items-center gap-1 rounded-2xl border-[1px] border-gray-100 bg-gray-50 px-8 py-4 dark:border-gray-800 dark:bg-gray-950"
        style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 2, height: 4 } }}
      >
        <View className="w-full">
          <Text className="text-base font-bold dark:text-white">{text1}</Text>
        </View>
        <View className="w-full">
          <Text className="text-sm text-gray-500 dark:text-gray-500">{text2}</Text>
        </View>
      </View>
    </View>
  ),
};

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
  showToast: (message: { title: string; description?: string }) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  showToast: () => {},
});

export default function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // context
  const { userDetail } = useContext(AuthContext);

  // state
  const [userProviderId, setUserProviderId] = useState<string>();

  // hooks
  const router = useRouter();
  const pathname = usePathname();

  // queries
  const { createUserNotification } = useUserNotification(
    { userUniqueId: userDetail?.id || '' },
    {
      onSuccess: (data) => {
        handleUpdateUserProviderId(data.id);
      },
    },
  );
  const { pages, refetch } = useNotificationHistories({ page: 0, size: 25 });
  const notifications = pages.reduce(
    (current, value) => current.concat(value.content),
    [] as UserNotificationHistory[],
  );

  // useEffect
  useEffect(() => {
    async function setBadgeCount(count: number) {
      await Notifications.setBadgeCountAsync(count);
    }

    setBadgeCount(notifications.filter((item) => !item.isRead).length);
  }, [notifications]);

  useEffect(() => {
    SecureStore.getItemAsync(KEY_USER_PROVIDER_ID).then((data) => {
      if (!data) {
        // init
        handleInit();

        return;
      }

      handleUpdateUserProviderId(data);
    });

    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      showToast({
        id: notification.request.identifier,
        title: notification.request.content.title || 'On Time 알리미',
        description: notification.request.content.body || '',
        read: false,
      });

      refetch();
    });

    const responseReceivedListener = Notifications.addNotificationResponseReceivedListener((response) => {
      refetch();

      pathname !== '/notifications' && router.push('/(tabs)/(home)/notifications');
    });

    return () => {
      responseReceivedListener.remove();
      receivedListener.remove();
    };
  }, [userDetail]);

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

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowBadge: true,
        allowAlert: true,
        allowSound: true,
      },
    });

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

  const showToast = ({
    id,
    title,
    description,
    read = true,
  }: {
    id?: string;
    title: string;
    description?: string;
    read?: boolean;
  }) => {
    Toast.hide();
    Toast.show({
      type: 'selectedToast',
      text1: title,
      text2: description,
    });
  };

  // memorize
  const memorizedContextValue = useMemo<NotificationContextType>(
    () => ({ userProviderId, showToast }),
    [userProviderId],
  );

  return (
    <NotificationContext value={memorizedContextValue}>
      {children}
      <Toast config={toastConfig} />
    </NotificationContext>
  );
}

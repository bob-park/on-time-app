import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Linking, Text, View } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';
import uuid from 'react-native-uuid';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import { useUserNotification } from '@/domain/notification/queries/userNotification';
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
  messages: NotificationMessage[];
  showToast: (message: { title: string; description?: string }) => void;
  onRead: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  messages: [],
  showToast: () => {},
  onRead: () => {},
});

export default function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // context
  const { user } = useContext(AuthContext);

  // state
  const [userProviderId, setUserProviderId] = useState<string>();
  const [messages, setMessages] = useState<NotificationMessage[]>([]);

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
        read: false,
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

  const showToast = ({ title, description, read = true }: { title: string; description?: string; read?: boolean }) => {
    Toast.hide();
    Toast.show({
      type: 'selectedToast',
      text1: title,
      text2: description,
    });

    setMessages((prev) => {
      const newMessages = prev.slice();

      newMessages.unshift({ id: uuid.v4(), title, message: description, read, createdDate: new Date() });

      return newMessages;
    });
  };

  const handleReadMessage = (id: string) => {
    setMessages(messages.map((message) => (message.id === id ? { ...message, read: true } : message)));
  };

  // memorize
  const memorizedContextValue = useMemo<NotificationContextType>(
    () => ({ userProviderId, messages, showToast, onRead: handleReadMessage }),
    [userProviderId, messages],
  );

  return (
    <NotificationContext value={memorizedContextValue}>
      {children}
      <Toast config={toastConfig} />
    </NotificationContext>
  );
}

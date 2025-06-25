import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Linking, Text, View } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';
import uuid from 'react-native-uuid';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { usePathname, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useUserNotification } from '@/domain/notification/queries/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

const KEY_USER_PROVIDER_ID = 'userProviderId';
const KEY_NOTIFICATION_MESSAGES = 'notificationMessages';

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
  onClearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  messages: [],
  showToast: () => {},
  onRead: () => {},
  onClearAll: () => {},
});

export default function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // context
  const { userDetail } = useContext(AuthContext);

  // state
  const [userProviderId, setUserProviderId] = useState<string>();
  const [messages, setMessages] = useState<NotificationMessage[]>([]);

  // hooks
  const router = useRouter();
  const pathname = usePathname();

  // queries
  const { createUserNotification } = useUserNotification(
    { userUniqueId: userDetail?.uniqueId || '' },
    {
      onSuccess: (data) => {
        handleUpdateUserProviderId(data.id);
      },
    },
  );

  // useEffect
  useEffect(() => {
    // TODO: server 에서 notifications 목록 조회로 변경 필요
    AsyncStorage.getItem(KEY_NOTIFICATION_MESSAGES).then((data) => {
      if (!data) {
        return;
      }

      setMessages(JSON.parse(data));
    });
  }, []);

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
    });

    const responseReceivedListener = Notifications.addNotificationResponseReceivedListener((response) => {
      handleAddMessage({
        id: response.notification.request.identifier,
        title: response.notification.request.content.title || 'On Time 알리미',
        message: response.notification.request.content.body || '',
        read: false,
        createdDate: new Date(),
      });

      pathname !== '/notifications' && router.push('/(tabs)/(home)/notifications');
    });

    return () => {
      responseReceivedListener.remove();
      receivedListener.remove();
    };
  }, [userDetail]);

  useEffect(() => {
    const savedMessages = messages.slice(0, 10);

    AsyncStorage.setItem(KEY_NOTIFICATION_MESSAGES, JSON.stringify(savedMessages)).then(() => {});
  }, [messages]);

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

    handleAddMessage({ id: id ?? uuid.v4(), title: title, message: description, read, createdDate: new Date() });
  };

  const handleAddMessage = (message: NotificationMessage) => {
    setMessages((prev) => {
      const newMessages = prev.slice();

      if (newMessages.some((item) => item.id === message.id)) {
        return newMessages;
      }

      newMessages.unshift(message);

      return newMessages;
    });
  };

  const handleReadMessage = (id: string) => {
    setMessages(messages.map((message) => (message.id === id ? { ...message, read: true } : message)));
  };

  // memorize
  const memorizedContextValue = useMemo<NotificationContextType>(
    () => ({ userProviderId, messages, showToast, onRead: handleReadMessage, onClearAll: () => setMessages([]) }),
    [userProviderId, messages],
  );

  return (
    <NotificationContext value={memorizedContextValue}>
      {children}
      <Toast config={toastConfig} />
    </NotificationContext>
  );
}

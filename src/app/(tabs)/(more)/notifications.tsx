import { useContext } from 'react';

import { Switch, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

import { useUpdateUserNotification, useUserNotifications } from '@/domain/notification/queries/userNotification';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

function parseNotificationType(type: NotificationType) {
  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return '모바일';
    case 'SLACK':
      return 'SLACK';
    case 'SMTP':
      return '메일';
    default:
      return '';
  }
}

function parseNotificationIcon(type: NotificationType, theme: 'dark' | 'light') {
  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return <Entypo name="mobile" size={24} color={theme === 'light' ? 'black' : 'white'} />;
    case 'SLACK':
      return <FontAwesome5 name="slack" size={24} color={theme === 'light' ? 'black' : 'white'} />;
    case 'SMTP':
      return <MaterialIcons name="email" size={24} color={theme === 'light' ? 'black' : 'white'} />;
    default:
      return '';
  }
}

export default function NotificationSettings() {
  // context
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { userProviderId } = useContext(NotificationContext);

  // hooks
  const router = useRouter();

  // queries
  const { notificationProviders } = useUserNotifications({ userUniqueId: user?.uniqueId });
  const { updateProvider } = useUpdateUserNotification({ userUniqueId: user?.uniqueId || '' }, {});

  // handle
  const handleUpdateEnabled = ({ providerId, enabled }: { providerId: string; enabled: boolean }) => {
    updateProvider({ userProviderId: providerId, enabled });
  };

  return (
    <View className="flex size-full flex-col items-center gap-4">
      {/* header */}
      <View className="relative flex w-full flex-row items-center justify-center gap-4">
        {/* backward */}
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
        </TouchableOpacity>

        <View className="flex flex-row items-end gap-1">
          <Text className="text-xl font-bold dark:text-white">알림 설정</Text>
        </View>
      </View>

      {/* contents */}
      <View className="mt-5 w-full px-3">
        <View className="flex flex-col items-center gap-1">
          {notificationProviders
            .filter((provider) =>
              ['IOS', 'ANDROID'].includes(provider.provider.type) ? provider.id === userProviderId : true,
            )
            .map((provider) => (
              <View
                key={`notification-providers-item-${provider.id}`}
                className="flex h-16 w-full flex-row items-center gap-3"
              >
                <View className="w-10 flex-none">{parseNotificationIcon(provider.provider.type, theme)}</View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {parseNotificationType(provider.provider.type)}
                  </Text>
                </View>
                <View className="w-14 flex-none">
                  <Switch
                    value={provider.enabled}
                    onValueChange={(value) => handleUpdateEnabled({ providerId: provider.id, enabled: value })}
                  />
                </View>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
}

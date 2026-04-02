import { useContext } from 'react';

import { Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FontAwesome5 } from '@expo/vector-icons';

import { useUpdateUserNotification, useUserNotifications } from '@/domain/notification/queries/userNotification';
import { Icon } from '@/shared/components/Icon';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 2,
  },
});

function parseNotificationType(type: NotificationType) {
  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return '모바일';
    case 'SLACK':
      return 'SLACK';
    case 'SMTP':
      return '메일';
    case 'FLOW':
    case 'FLOW_HOOKS':
      return 'FLOW';
    default:
      return '';
  }
}

function NotificationIcon({ type, theme }: { type: NotificationType; theme: 'dark' | 'light' }) {
  const iconColor = theme === 'light' ? '#3b82f6' : '#60a5fa';

  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return <Icon sf="iphone" fallback="📱" size={18} color={iconColor} />;
    case 'SLACK':
      return <FontAwesome5 name="slack" size={18} color={theme === 'light' ? '#611f69' : '#e0b0ff'} />;
    case 'SMTP':
      return <Icon sf="envelope" fallback="📧" size={18} color={iconColor} />;
    case 'FLOW':
    case 'FLOW_HOOKS':
      return <Icon sf="bolt" fallback="⚡" size={18} color="#f59e0b" />;
    default:
      return <Icon sf="bell" fallback="🔔" size={18} color={iconColor} />;
  }
}

function getIconBg(type: NotificationType): string {
  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return 'rgba(59,130,246,0.12)';
    case 'SLACK':
      return 'rgba(168,85,247,0.12)';
    case 'SMTP':
      return 'rgba(99,102,241,0.12)';
    case 'FLOW':
    case 'FLOW_HOOKS':
      return 'rgba(245,158,11,0.12)';
    default:
      return 'rgba(59,130,246,0.12)';
  }
}

export default function NotificationSettings() {
  // context
  const { userDetail } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { userProviderId } = useContext(NotificationContext);

  // hooks
  const router = useRouter();

  // queries
  const { notificationProviders } = useUserNotifications({ userUniqueId: userDetail?.id });
  const { updateProvider } = useUpdateUserNotification({ userUniqueId: userDetail?.id || '' }, {});

  // handle
  const handleUpdateEnabled = ({ providerId, enabled }: { providerId: string; enabled: boolean }) => {
    updateProvider({ userProviderId: providerId, enabled });
  };

  const filteredProviders = notificationProviders.filter((provider) =>
    ['IOS', 'ANDROID'].includes(provider.provider.type) ? provider.id === userProviderId : true,
  );

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View className="relative mb-6 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon
            sf="chevron.left"
            fallback="‹"
            size={24}
            weight="semibold"
            color={theme === 'light' ? '#1C1C1E' : '#ffffff'}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold dark:text-white">알림 설정</Text>
      </View>

      {/* notification providers card */}
      <View className="mt-4 overflow-hidden rounded-2xl bg-white dark:bg-gray-900" style={CARD_SHADOW}>
        {filteredProviders.map((provider, index) => (
          <View key={`notification-providers-item-${provider.id}`}>
            <View className="flex flex-row items-center gap-3 px-4 py-3.5">
              {/* icon */}
              <View
                className="size-9 flex-none items-center justify-center rounded-xl"
                style={{ backgroundColor: getIconBg(provider.provider.type) }}
              >
                <NotificationIcon type={provider.provider.type} theme={theme} />
              </View>

              {/* label */}
              <Text className="flex-1 text-[15px] font-semibold dark:text-white">
                {parseNotificationType(provider.provider.type)}
              </Text>

              {/* toggle */}
              <Switch
                value={provider.enabled}
                onValueChange={(value) => handleUpdateEnabled({ providerId: provider.id, enabled: value })}
              />
            </View>

            {index < filteredProviders.length - 1 && (
              <View className="ml-[60px] border-b border-gray-100 dark:border-gray-800" />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

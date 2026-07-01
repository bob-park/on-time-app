import { useContext } from 'react';

import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import { FontAwesome5 } from '@expo/vector-icons';

import { useUpdateUserNotification, useUserNotifications } from '@/domain/notification/queries/userNotification';
import { Icon } from '@/shared/components/Icon';
import { enterListItem, enterPage } from '@/shared/components/motion/entering';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';

const BRAND = '#1ed760';
const MUTED = '#8a8f99';

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

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return <Icon sf="iphone" fallback="📱" size={18} color={BRAND} />;
    case 'SLACK':
      return <FontAwesome5 name="slack" size={18} color={BRAND} />;
    case 'SMTP':
      return <Icon sf="envelope" fallback="📧" size={18} color={BRAND} />;
    case 'FLOW':
    case 'FLOW_HOOKS':
      return <Icon sf="bolt" fallback="⚡" size={18} color={BRAND} />;
    default:
      return <Icon sf="bell" fallback="🔔" size={18} color={BRAND} />;
  }
}

export default function NotificationSettings() {
  // context
  const { userinfo: userDetail } = useContext(AuthContext);
  const { userProviderId } = useContext(NotificationContext);

  // hooks
  const router = useRouter();

  // queries
  const { notificationProviders } = useUserNotifications({ userUniqueId: userDetail?.sub });
  const { updateProvider } = useUpdateUserNotification({ userUniqueId: userDetail?.sub || '' }, {});

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
      <Reanimated.View entering={enterPage(0)} className="relative mb-6 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon sf="chevron.left" fallback="‹" size={24} weight="semibold" color={MUTED} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-content dark:text-content-dark">알림 설정</Text>
      </Reanimated.View>

      {/* notification providers card */}
      <View className="mt-2 overflow-hidden rounded-3xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
        {filteredProviders.map((provider, index) => (
          <Reanimated.View key={`notification-providers-item-${provider.id}`} entering={enterListItem(index, 80)}>
            <View className="flex flex-row items-center gap-3 px-4 py-3.5">
              {/* icon */}
              <View className="size-9 flex-none items-center justify-center rounded-xl bg-elevated dark:bg-elevated-dark">
                <NotificationIcon type={provider.provider.type} />
              </View>

              {/* label */}
              <Text className="flex-1 text-[15px] font-semibold text-content dark:text-content-dark">
                {parseNotificationType(provider.provider.type)}
              </Text>

              {/* toggle */}
              <Switch
                value={provider.enabled}
                trackColor={{ true: BRAND }}
                onValueChange={(value) => handleUpdateEnabled({ providerId: provider.id, enabled: value })}
              />
            </View>

            {index < filteredProviders.length - 1 && (
              <View className="ml-[60px] border-b border-border dark:border-border-dark" />
            )}
          </Reanimated.View>
        ))}
      </View>
    </ScrollView>
  );
}

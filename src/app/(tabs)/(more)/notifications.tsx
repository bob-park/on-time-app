import { useContext } from 'react';

import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import { FontAwesome5 } from '@expo/vector-icons';

import { useUpdateUserNotification, useUserNotifications } from '@/domain/notification/queries/userNotification';
import { Icon } from '@/shared/components/Icon';
import { enterPage } from '@/shared/components/motion/entering';
import { ListGroup, ListItem, usePalette } from '@/shared/components/ui';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';

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

function NotificationIcon({ type, color }: { type: NotificationType; color: string }) {
  switch (type) {
    case 'ANDROID':
    case 'IOS':
      return <Icon sf="iphone" fallback="📱" size={16} color={color} />;
    case 'SLACK':
      return <FontAwesome5 name="slack" size={16} color={color} />;
    case 'SMTP':
      return <Icon sf="envelope" fallback="📧" size={16} color={color} />;
    case 'FLOW':
    case 'FLOW_HOOKS':
      return <Icon sf="bolt" fallback="⚡" size={16} color={color} />;
    default:
      return <Icon sf="bell" fallback="🔔" size={16} color={color} />;
  }
}

export default function NotificationSettings() {
  // context
  const { userinfo: userDetail } = useContext(AuthContext);
  const { userProviderId } = useContext(NotificationContext);

  // hooks
  const router = useRouter();
  const palette = usePalette();

  // queries
  const { notificationProviders } = useUserNotifications({ userUniqueId: userDetail?.sub });
  const { updateProvider } = useUpdateUserNotification({ userUniqueId: userDetail?.sub || '' }, {});

  const filteredProviders = notificationProviders.filter((provider) =>
    ['IOS', 'ANDROID'].includes(provider.provider.type) ? provider.id === userProviderId : true,
  );

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      <Reanimated.View entering={enterPage(0)} className="relative mb-6 flex flex-row items-center justify-center">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          className="absolute left-0 size-11 items-start justify-center"
          onPress={() => router.back()}
        >
          <Icon sf="chevron.left" fallback="‹" size={22} weight="semibold" color={palette.content} />
        </TouchableOpacity>
        <Text className="text-content dark:text-content-dark text-xl font-bold">알림 설정</Text>
      </Reanimated.View>

      <Reanimated.View entering={enterPage(80)}>
        <ListGroup>
          {filteredProviders.map((provider) => (
            <ListItem
              key={`notification-providers-item-${provider.id}`}
              left={
                <View className="bg-brand-subtle size-8 items-center justify-center rounded-[10px]">
                  <NotificationIcon type={provider.provider.type} color={palette.brand} />
                </View>
              }
              label={parseNotificationType(provider.provider.type)}
              right={
                <Switch
                  value={provider.enabled}
                  trackColor={{ true: palette.brand }}
                  onValueChange={(value) => updateProvider({ userProviderId: provider.id, enabled: value })}
                />
              }
            />
          ))}
        </ListGroup>
      </Reanimated.View>
    </ScrollView>
  );
}

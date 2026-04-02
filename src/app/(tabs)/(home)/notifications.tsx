import { useContext } from 'react';

import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useNotificationHistories, useReadNotification } from '@/domain/notification/queries/userNotification';
import { Icon } from '@/shared/components/Icon';
import dayjs from '@/shared/dayjs';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';

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

const MessageItem = ({
  message,
  onRead,
}: Readonly<{ message: UserNotificationHistory; onRead: (id: string) => void }>) => {
  return (
    <View className="mt-3 px-1">
      <TouchableOpacity
        className={`flex flex-row items-start gap-3 rounded-2xl bg-white px-4 py-4 dark:bg-gray-900 ${
          message.isRead ? 'opacity-60' : ''
        }`}
        style={CARD_SHADOW}
        disabled={message.isRead}
        onPress={() => onRead(message.id)}
      >
        {/* icon container */}
        <View className="relative flex-none">
          <View
            className="size-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}
          >
            <Icon sf="bell" fallback="🔔" size={18} color="#3b82f6" />
          </View>

          {/* unread dot */}
          {!message.isRead && <View className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-blue-500" />}
        </View>

        {/* body */}
        <View className="flex flex-1 flex-col gap-1">
          <Text className="text-[15px] font-semibold dark:text-white">{message.title}</Text>
          <Text
            className="text-sm text-gray-500 dark:text-gray-400"
            textBreakStrategy="balanced"
            lineBreakStrategyIOS="hangul-word"
          >
            {message.contents}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {dayjs(message.createdDate).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const NoMessage = () => {
  return (
    <View className="mt-24 flex w-full flex-col items-center justify-center gap-3">
      <LottieView style={{ width: 150, height: 150 }} source={NoDataLottie} autoPlay loop />

      <View className="items-center justify-center">
        <Text className="text-base font-semibold text-gray-400 dark:text-gray-500">새로운 소식이 없나봐요.</Text>
      </View>
    </View>
  );
};

export default function NotificationsPage() {
  // context
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // queries
  const { read } = useReadNotification({});
  const { pages, refetch, isLoading, hasNextPage, fetchNextPage } = useNotificationHistories({ page: 0, size: 25 });
  const notifications = pages.reduce(
    (current, value) => current.concat(value.content),
    [] as UserNotificationHistory[],
  );

  // handle
  const handleRead = (id: string) => {
    read(id);
  };

  const handleAllRead = () => {
    notifications.filter((item) => !item.isRead).forEach((item) => read(item.id));
  };

  const allRead = notifications.length === 0 || notifications.every((n) => n.isRead);

  return (
    <View className="flex size-full flex-col">
      {/* header */}
      <View className="relative mb-2 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon
            sf="chevron.left"
            fallback="‹"
            size={24}
            weight="semibold"
            color={theme === 'light' ? '#1C1C1E' : '#ffffff'}
          />
        </TouchableOpacity>

        <Text className="text-xl font-bold dark:text-white">알림</Text>

        <TouchableOpacity className="absolute right-0" disabled={allRead} onPress={handleAllRead}>
          <Text
            className={`text-[14px] font-semibold ${allRead ? 'text-gray-300 dark:text-gray-600' : 'text-blue-500'}`}
          >
            모두 읽기
          </Text>
        </TouchableOpacity>
      </View>

      {/* list */}
      <View className="flex-1">
        <FlashList
          data={notifications}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
          renderItem={({ item }) => <MessageItem message={item} onRead={handleRead} />}
          ListFooterComponent={notifications.length === 0 ? <NoMessage /> : null}
          onRefresh={() => refetch()}
          onEndReached={() => hasNextPage && fetchNextPage()}
        />
      </View>
    </View>
  );
}

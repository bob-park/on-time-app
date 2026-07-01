import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useNotificationHistories, useReadNotification } from '@/domain/notification/queries/userNotification';
import { Icon } from '@/shared/components/Icon';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterListItem, enterPage } from '@/shared/components/motion/entering';
import dayjs from '@/shared/dayjs';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

const MessageItem = ({
  message,
  onRead,
}: Readonly<{ message: UserNotificationHistory; onRead: (id: string) => void }>) => {
  return (
    <View className="mt-3 px-1">
      <AnimatedPressable
        className={`flex flex-row items-start gap-3 rounded-3xl border bg-surface px-4 py-4 dark:bg-surface-dark ${
          message.isRead ? 'border-border opacity-60 dark:border-border-dark' : 'border-brand'
        }`}
        disabled={message.isRead}
        scaleTo={0.99}
        onPress={() => onRead(message.id)}
      >
        {/* icon container */}
        <View className="relative flex-none">
          <View className="size-9 items-center justify-center rounded-xl bg-elevated dark:bg-elevated-dark">
            <Icon sf="bell" fallback="🔔" size={18} color="#1ed760" />
          </View>

          {/* unread dot */}
          {!message.isRead && <View className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-brand" />}
        </View>

        {/* body */}
        <View className="flex flex-1 flex-col gap-1">
          <Text className="text-[15px] font-semibold text-content dark:text-content-dark">{message.title}</Text>
          <Text
            className="text-sm text-muted dark:text-muted-dark"
            textBreakStrategy="balanced"
            lineBreakStrategyIOS="hangul-word"
          >
            {message.contents}
          </Text>
          <Text className="mt-0.5 text-xs text-muted dark:text-muted-dark" style={TABULAR}>
            {dayjs(message.createdDate).fromNow()}
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
};

const NoMessage = () => {
  return (
    <View className="mt-24 flex w-full flex-col items-center justify-center gap-3">
      <LottieView style={{ width: 150, height: 150 }} source={NoDataLottie} autoPlay loop />

      <View className="items-center justify-center">
        <Text className="text-base font-semibold text-muted dark:text-muted-dark">새로운 소식이 없나봐요.</Text>
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

  // mode-safe raw colors
  const contentColor = theme === 'light' ? '#15171c' : '#ffffff';

  return (
    <View className="flex size-full flex-col bg-base dark:bg-base-dark">
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="relative mb-2 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon sf="chevron.left" fallback="‹" size={24} weight="semibold" color={contentColor} />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-content dark:text-content-dark">알림</Text>

        <TouchableOpacity className="absolute right-0" disabled={allRead} onPress={handleAllRead}>
          <Text
            className={`text-[14px] font-semibold ${
              allRead ? 'text-muted dark:text-muted-dark' : 'text-brand'
            }`}
          >
            모두 읽기
          </Text>
        </TouchableOpacity>
      </Reanimated.View>

      {/* list */}
      <View className="flex-1">
        <FlashList
          data={notifications}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
          renderItem={({ item, index }) => (
            <Reanimated.View entering={enterListItem(index, 80)}>
              <MessageItem message={item} onRead={handleRead} />
            </Reanimated.View>
          )}
          ListFooterComponent={notifications.length === 0 ? <NoMessage /> : null}
          onRefresh={() => refetch()}
          onEndReached={() => hasNextPage && fetchNextPage()}
        />
      </View>
    </View>
  );
}

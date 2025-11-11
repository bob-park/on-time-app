import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useNotificationHistories, useReadNotification } from '@/domain/notification/queries/userNotification';
import dayjs from '@/shared/dayjs';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';

const MessageItem = ({
  mode = 'light',
  message,
  onRead,
}: Readonly<{ mode?: 'light' | 'dark'; message: UserNotificationHistory; onRead: (id: string) => void }>) => {
  return (
    <View className="relative mt-4 px-3">
      <TouchableOpacity
        className="flex flex-row items-center gap-3 rounded-2xl bg-white px-6 py-4 dark:bg-black"
        style={{
          shadowColor: mode === 'light' ? '#000' : '#FFF',
          shadowOpacity: 0.15,
          shadowOffset: { width: 1, height: 2 },
        }}
        disabled={message.isRead}
        onPress={() => onRead(message.id)}
      >
        <View className="flex-1">
          <View className="flex w-full flex-col items-center gap-1">
            <Text className="w-full text-lg font-semibold dark:text-white">{message.title}</Text>
            <Text
              className="w-full text-sm text-gray-500 dark:text-gray-400"
              textBreakStrategy="balanced"
              lineBreakStrategyIOS="hangul-word"
            >
              {message.contents}
            </Text>
          </View>
        </View>
        <View className="w-16 flex-none">
          <View className="-mt-5">
            <Text
              className="text-right text-xs text-gray-500 dark:text-gray-400"
              numberOfLines={2}
              lineBreakMode="tail"
            >
              {dayjs(message.createdDate).fromNow()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {!message.isRead && (
        <View className="absolute -top-2 left-0 w-12 items-center justify-center rounded-lg bg-red-500 py-1">
          <Text className="text-xs font-bold text-white">new</Text>
        </View>
      )}
    </View>
  );
};

const NoMessage = () => {
  return (
    <View className="mt-24 flex w-full flex-col items-center justify-center gap-3">
      <LottieView style={{ width: 150, height: 150 }} source={NoDataLottie} autoPlay loop />

      <View className="items-center justify-center">
        <Text className="text-lg font-extrabold text-gray-500">새로운 소식이 없나봐요.</Text>
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

  return (
    <View className="relative flex size-full flex-col items-center gap-2">
      {/* headers */}
      <View className="w-full">
        <View className="flex flex-row items-center justify-between gap-4">
          <View className="flex flex-row items-center gap-4">
            {/* backward */}
            <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
              <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
            </TouchableOpacity>

            {/* today */}
            <View className="flex flex-row items-end gap-1">
              <Text className="text-xl font-bold dark:text-white">알림</Text>
            </View>
          </View>

          {/* clear action */}
          <View className="">
            <TouchableOpacity
              className="h-10 w-20 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-800"
              disabled={notifications.length === 0}
              onPress={handleAllRead}
            >
              <Text className="text-sm font-bold text-gray-900 dark:text-gray-100">모두 읽기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="size-full">
        <FlashList
          className="w-full"
          data={notifications}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <MessageItem mode={theme} message={item} onRead={handleRead} />}
          ListFooterComponent={notifications.length === 0 ? <NoMessage /> : <View className="h-20 w-full"></View>}
          onRefresh={() => refetch()}
          onEndReached={() => hasNextPage && fetchNextPage()}
        />

        <View className="h-24 w-full" />
      </View>
    </View>
  );
}

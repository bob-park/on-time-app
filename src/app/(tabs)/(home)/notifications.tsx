import { useContext } from 'react';

import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo, MaterialIcons } from '@expo/vector-icons';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import LottieView from 'lottie-react-native';

dayjs.extend(relativeTime).locale(ko);

const MessageItem = ({
  mode = 'light',
  message,
  onRead,
}: Readonly<{ mode?: 'light' | 'dark'; message: NotificationMessage; onRead: (id: string) => void }>) => {
  return (
    <View className="relative mt-4 px-3">
      <TouchableOpacity
        className="flex flex-row items-center gap-3 rounded-lg bg-gray-50 px-6 py-4 dark:bg-gray-900"
        style={{
          shadowColor: mode === 'light' ? '#000' : '#FFF',
          shadowOpacity: 0.15,
          shadowOffset: { width: 1, height: 2 },
        }}
        disabled={message.read}
        onPress={() => onRead(message.id)}
      >
        <View className="flex-1">
          <View className="flex w-full flex-col items-center gap-1">
            <Text className="w-full text-lg font-semibold dark:text-white">{message.title}</Text>
            <Text className="w-full text-sm text-gray-500 dark:text-gray-400">{message.message}</Text>
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

      {!message.read && (
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
  const { messages, onRead, onClearAll } = useContext(NotificationContext);

  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center gap-4 bg-white dark:bg-black">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center gap-4">
          {/* backward */}
          <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
          </TouchableOpacity>

          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-xl font-bold dark:text-white">알림</Text>
          </View>

          {/* clear action */}
          <View className="absolute right-3 top-0">
            <TouchableOpacity
              className="size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900"
              disabled={messages.length === 0}
              onPress={() => onClearAll()}
            >
              <MaterialIcons name="delete-outline" size={24} color={theme === 'light' ? 'black' : 'white'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SafeAreaView className="size-full px-2">
        <FlashList
          className=""
          data={messages}
          renderItem={({ item }) => <MessageItem mode={theme} message={item} onRead={onRead} />}
          ListFooterComponent={messages.length === 0 ? <NoMessage /> : <View className="h-16 w-full"></View>}
          onRefresh={() => {}}
        />
      </SafeAreaView>
    </View>
  );
}

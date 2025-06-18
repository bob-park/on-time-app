import { useContext } from 'react';

import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime).locale(ko);

const MessageItem = ({ message, onRead }: Readonly<{ message: NotificationMessage; onRead: (id: string) => void }>) => {
  return (
    <View className="relative px-2 py-3">
      <TouchableOpacity
        className="flex flex-row items-center gap-3 rounded-lg bg-gray-50 px-6 py-4"
        style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 1, height: 2 } }}
        disabled={message.read}
        onPress={() => onRead(message.id)}
      >
        <View className="flex-1">
          <View className="flex w-full flex-col items-center gap-1">
            <Text className="w-full text-lg font-semibold">{message.title}</Text>
            <Text className="w-full text-sm text-gray-500">{message.message}</Text>
          </View>
        </View>
        <View className="w-16 flex-none">
          <View className="-mt-5">
            <Text className="text-right text-xs text-gray-500" numberOfLines={2} lineBreakMode="tail">
              {dayjs(message.createdDate).fromNow()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {!message.read && (
        <View className="absolute left-0 top-1 w-12 items-center justify-center rounded-lg bg-red-500 py-1">
          <Text className="text-xs font-bold text-white">new</Text>
        </View>
      )}
    </View>
  );
};

export default function NotificationsPage() {
  // context
  const { theme } = useContext(ThemeContext);
  const { messages, onRead } = useContext(NotificationContext);

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
        </View>
      </View>

      <SafeAreaView className="size-full px-2">
        <FlashList
          className=""
          data={messages}
          renderItem={({ item }) => <MessageItem message={item} onRead={onRead} />}
          ListFooterComponent={<View className="h-16 w-full"></View>}
          onRefresh={() => {}}
        />
      </SafeAreaView>
    </View>
  );
}

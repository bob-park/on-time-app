import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function NotificationsPage() {
  // context
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center gap-10 bg-white dark:bg-black">
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

      <View className="w-full">
        <View className="flex flex-col items-center justify-center">
          <Text className="text-2xl font-bold">준비중</Text>
        </View>
      </View>
    </View>
  );
}

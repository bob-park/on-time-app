import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo, FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

export default function Theme() {
  // context
  const { theme, preference, onUpdatePreference } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center gap-4">
      {/* header */}
      <View className="relative flex w-full flex-row items-center justify-center gap-4">
        {/* backward */}
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
        </TouchableOpacity>

        <View className="flex flex-row items-end gap-1">
          <Text className="text-xl font-bold dark:text-white">화면 테마</Text>
        </View>
      </View>

      {/* contents */}
      <View className="mt-10 w-full px-3">
        <View className="flex flex-col items-center gap-10">
          <TouchableOpacity
            className="w-full flex-row items-center justify-between gap-3"
            onPress={() => onUpdatePreference('light')}
          >
            <View className="flex flex-row items-center gap-1">
              <View className="w-12 flex-none">
                <Entypo name="light-up" size={24} color={theme === 'light' ? 'black' : 'white'} />
              </View>
              <View className="">
                <Text className="text-lg font-bold dark:text-white">밝은 모드</Text>
              </View>
            </View>

            {preference === 'light' && (
              <View className="">
                <FontAwesome6 name="check" size={24} color={theme === 'light' ? 'black' : 'white'} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full flex-row items-center justify-between gap-3"
            onPress={() => onUpdatePreference('dark')}
          >
            <View className="flex flex-row items-center gap-1">
              <View className="w-12 flex-none">
                <MaterialIcons name="dark-mode" size={24} color={theme === 'light' ? 'black' : 'white'} />
              </View>
              <View className="">
                <Text className="text-lg font-bold dark:text-white">어두운 모드</Text>
              </View>
            </View>

            {preference === 'dark' && (
              <View className="">
                <FontAwesome6 name="check" size={24} color={theme === 'light' ? 'black' : 'white'} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full flex-row items-center justify-between gap-3"
            onPress={() => onUpdatePreference('system')}
          >
            <View className="flex flex-row items-center gap-1">
              <View className="w-12 flex-none">
                <MaterialCommunityIcons
                  name="circle-half-full"
                  size={24}
                  color={theme === 'light' ? 'black' : 'white'}
                />
              </View>
              <View className="">
                <Text className="text-lg font-bold dark:text-white">시스템 설정과 같이</Text>
              </View>
            </View>

            {preference === 'system' && (
              <View className="">
                <FontAwesome6 name="check" size={24} color={theme === 'light' ? 'black' : 'white'} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

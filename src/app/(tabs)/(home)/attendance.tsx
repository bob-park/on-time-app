import { useContext } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';

const WEEKEND_DAYS = [0, 6];

export default function Attendance() {
  // context
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center px-4 py-2">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center gap-4">
          {/* backward */}
          <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
          </TouchableOpacity>

          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-3xl font-bold dark:text-white">{dayjs().format('MM월 DD일')}</Text>
            <Text
              className={cx('text-xl font-bold', {
                'text-black dark:text-white': !WEEKEND_DAYS.includes(dayjs().day()),
                'text-blue-500 dark:text-blue-300': dayjs().day() === 6,
                'text-red-600 dark:text-red-300': dayjs().day() === 0,
              })}
            >
              ({getDaysOfWeek(dayjs().day())})
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

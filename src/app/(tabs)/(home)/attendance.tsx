import { Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';

const WEEKEND_DAYS = [0, 6];

export default function Attendance() {
  // hooks
  const router = useRouter();

  return (
    <View className="flex size-full flex-col items-center gap-4 p-4">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center gap-4">
          {/* backward */}
          <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color="black" />
          </TouchableOpacity>

          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-3xl font-bold">{dayjs().format('MM월 DD일')}</Text>
            <Text
              className={cx('text-xl font-bold', {
                'text-black': !WEEKEND_DAYS.includes(dayjs().day()),
                'text-blue-500': dayjs().day() === 6,
                'text-red-600': dayjs().day() === 0,
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

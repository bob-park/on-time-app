import { Pressable, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import dayjs from '@/shared/dayjs';
import { getDaysOfWeek } from '@/utils/parse';

export default function TodoScreen() {
  return (
    <View className="flex-1 bg-[#F5F5F7] pt-16 dark:bg-gray-950">
      {/* header */}
      <View className="px-5 pb-1 pt-2">
        <Text className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
          {dayjs().format('YYYY년 M월 D일')} {getDaysOfWeek(dayjs().day())}요일
        </Text>
        <Text className="text-[22px] font-bold leading-tight dark:text-white">할일</Text>
      </View>

      {/* empty state */}
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <View className="mb-1 size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Ionicons name="checkmark-done-outline" size={32} color="#8E8E93" />
        </View>
        <Text className="text-center text-[17px] font-bold dark:text-white">할일이 없어요</Text>
        <Text className="text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {'업무 목록을 추가하면\n여기서 관리할 수 있어요'}
        </Text>
        <Pressable className="mt-2 rounded-2xl bg-[#007AFF] px-7 py-3.5">
          <Text className="text-[15px] font-bold text-white">+ 할일 추가</Text>
        </Pressable>
      </View>
    </View>
  );
}

import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterHero, enterPage, enterSoft } from '@/shared/components/motion/entering';
import dayjs from '@/shared/dayjs';
import { getDaysOfWeek } from '@/utils/parse';

import Reanimated from 'react-native-reanimated';

export default function TodoScreen() {
  return (
    <View className="flex-1 bg-gray-50 pt-[68px] dark:bg-gray-950">
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="px-4 pb-2">
        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {dayjs().format('YYYY.M.D')} · {getDaysOfWeek(dayjs().day())}
        </Text>
        <Text className="mt-1 text-[28px] font-bold leading-none text-gray-900 dark:text-white">할일</Text>
      </Reanimated.View>

      {/* empty state */}
      <Reanimated.View
        entering={enterHero(120)}
        className="flex-1 items-center justify-center gap-4 px-8 pb-24"
      >
        <Reanimated.View
          entering={enterSoft(280)}
          className="size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <Ionicons name="checkmark-done-outline" size={32} color="#8E8E93" />
        </Reanimated.View>
        <View className="items-center gap-1.5">
          <Text className="text-center text-lg font-bold text-gray-900 dark:text-white">할일이 없어요</Text>
          <Text className="text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {'업무 목록을 추가하면\n여기서 관리할 수 있어요'}
          </Text>
        </View>
        <AnimatedPressable className="mt-3 rounded-2xl bg-blue-500 px-6 py-3.5">
          <Text className="text-base font-bold text-white">+ 할일 추가</Text>
        </AnimatedPressable>
      </Reanimated.View>
    </View>
  );
}

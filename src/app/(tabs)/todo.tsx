import { Text, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

import { enterHero, enterPage, enterSoft } from '@/shared/components/motion/entering';
import { Button } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { getDaysOfWeek } from '@/utils/parse';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

export default function TodoScreen() {
  return (
    <View className="flex-1 bg-base pt-[68px] dark:bg-base-dark">
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="px-4 pb-2">
        <Text
          className="text-xs font-semibold tracking-wider text-muted uppercase dark:text-muted-dark"
          style={TABULAR}
        >
          {dayjs().format('YYYY.M.D')} · {getDaysOfWeek(dayjs().day())}
        </Text>
        <Text className="mt-1 text-[28px] leading-none font-bold text-content dark:text-content-dark">할일</Text>
      </Reanimated.View>

      {/* empty state */}
      <Reanimated.View entering={enterHero(120)} className="flex-1 items-center justify-center gap-4 px-8 pb-24">
        <Reanimated.View
          entering={enterSoft(280)}
          className="size-16 items-center justify-center rounded-full bg-elevated dark:bg-elevated-dark"
        >
          <Ionicons name="checkmark-done-outline" size={32} color="#8a8f99" />
        </Reanimated.View>
        <View className="items-center gap-1.5">
          <Text className="text-center text-lg font-bold text-content dark:text-content-dark">할일이 없어요</Text>
          <Text className="text-center text-sm leading-relaxed text-muted dark:text-muted-dark">
            {'업무 목록을 추가하면\n여기서 관리할 수 있어요'}
          </Text>
        </View>
        <View className="mt-3">
          <Button label="+ 할일 추가" />
        </View>
      </Reanimated.View>
    </View>
  );
}

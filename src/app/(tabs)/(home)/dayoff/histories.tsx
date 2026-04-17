import { useContext, useEffect, useState } from 'react';

import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useVacations } from '@/domain/documents/queries/vacations';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterHero, enterListItem, enterPage } from '@/shared/components/motion/entering';
import { Icon } from '@/shared/components/Icon';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';
import Reanimated from 'react-native-reanimated';

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 2,
  },
});

function parseVacationType(vacationType: VacationType) {
  switch (vacationType) {
    case 'GENERAL':
      return '연차';
    case 'COMPENSATORY':
      return '보상 휴가';
    case 'OFFICIAL':
      return '공가';
    default:
      return '';
  }
}

const FILTER_OPTIONS: { key: VacationType | 'ALL'; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'GENERAL', label: '연차' },
  { key: 'COMPENSATORY', label: '보상 휴가' },
  { key: 'OFFICIAL', label: '공가' },
];

/** Smoothly ease a number from 0 to `value` using requestAnimationFrame. */
function useCountUp(value: number, durationMs = 800) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const start = Date.now();
    let rafId: number;
    const tick = () => {
      const t = Math.min((Date.now() - start) / durationMs, 1);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(eased * value));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);
  return display;
}

const VacationItem = ({ vacation }: Readonly<{ vacation: DocumentVacation }>) => {
  return (
    <View className="mt-3 px-1">
      <View
        className="flex w-full flex-row items-start gap-3 rounded-2xl bg-white px-4 py-4 dark:bg-gray-900"
        style={CARD_SHADOW}
      >
        {/* icon container */}
        <View
          className="size-9 flex-none items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}
        >
          <Icon sf="calendar" fallback="📆" size={18} color="#3b82f6" />
        </View>

        {/* body */}
        <View className="flex flex-1 flex-col gap-1">
          <Text className="text-[15px] font-semibold dark:text-white">{parseVacationType(vacation.vacationType)}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {dayjs(vacation.startDate).format('YYYY-MM-DD (dd)')}
            {dayjs(vacation.startDate).isBefore(vacation.endDate) && (
              <Text> - {dayjs(vacation.endDate).format('YYYY-MM-DD (dd)')}</Text>
            )}
          </Text>
        </View>

        {/* days */}
        <View className="items-end justify-center pt-1">
          <View className="flex-row items-baseline gap-0.5">
            <Text
              className="text-lg font-bold text-blue-500"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {vacation.usedDays}
            </Text>
            <Text className="text-xs font-semibold text-blue-500/80">일</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const NoVacation = () => {
  return (
    <View className="mt-24 flex w-full flex-col items-center justify-center gap-3">
      <LottieView style={{ width: 150, height: 150 }} source={NoDataLottie} autoPlay loop />

      <View className="items-center justify-center">
        <Text className="text-base font-semibold text-gray-400 dark:text-gray-500">휴가를 사용하지 않으셨군요?</Text>
      </View>
    </View>
  );
};

export default function DayoffHistoriesPage() {
  // context
  const { userDetail } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // query
  const { vacations, reload } = useVacations({
    userUniqueId: userDetail?.id,
    startDateFrom: dayjs().startOf('year').toDate(),
    endDateFrom: dayjs().endOf('year').toDate(),
    status: 'APPROVED',
    page: 0,
    size: 1000,
  });

  // state
  const [selectedVacationType, setSelectedVacationType] = useState<VacationType | 'ALL'>('ALL');
  const newVacations = vacations
    .slice()
    .filter((vacation) => (selectedVacationType === 'ALL' ? true : vacation.vacationType === selectedVacationType));

  newVacations.sort((o1, o2) => (dayjs(o1.startDate).isBefore(o2.startDate) ? 1 : -1));

  const totalDays = newVacations.reduce((current, vacation) => vacation.usedDays + current, 0);
  const animatedTotal = useCountUp(totalDays, 900);

  return (
    <View className="flex size-full flex-col">
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="relative mb-2 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Icon
            sf="chevron.left"
            fallback="‹"
            size={24}
            weight="semibold"
            color={theme === 'light' ? '#1C1C1E' : '#ffffff'}
          />
        </TouchableOpacity>
        <Text className="text-xl font-bold dark:text-white">휴가 내역</Text>
      </Reanimated.View>

      {/* year + total — 숫자가 주인공, count-up */}
      <Reanimated.View entering={enterHero(80)} className="mt-4 flex-row items-end justify-between">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {dayjs().format('YYYY')}년 사용 내역
          </Text>
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <Text
              className="text-[40px] font-bold leading-none text-gray-900 dark:text-white"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {animatedTotal}
            </Text>
            <Text className="text-base font-semibold text-gray-500 dark:text-gray-400">일</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">총 {newVacations.length}건</Text>
        </View>
      </Reanimated.View>

      {/* filter chips */}
      <Reanimated.View entering={enterPage(180)} className="mt-6 flex flex-row items-center gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = selectedVacationType === option.key;
          return (
            <AnimatedPressable
              key={option.key}
              className={`rounded-full px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
              disabled={isActive}
              onPress={() => setSelectedVacationType(option.key)}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {option.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </Reanimated.View>

      {/* list */}
      <Reanimated.View entering={enterPage(260)} className="mt-3 flex-1">
        <FlashList
          data={newVacations}
          refreshing={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
          renderItem={({ item, index }) => (
            <Reanimated.View entering={enterListItem(index, 260)}>
              <VacationItem vacation={item} />
            </Reanimated.View>
          )}
          ListFooterComponent={newVacations.length === 0 ? <NoVacation /> : null}
          onRefresh={() => reload()}
        />
      </Reanimated.View>
    </View>
  );
}

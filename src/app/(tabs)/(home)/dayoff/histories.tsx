import { useContext, useEffect, useLayoutEffect, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import { Entypo, Ionicons } from '@expo/vector-icons';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useVacations } from '@/domain/documents/queries/vacations';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterHero, enterListItem, enterPage } from '@/shared/components/motion/entering';
import { StatusPill } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';
import LottieView from 'lottie-react-native';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

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

function parseStatus(status: ApprovalStatus): { label: string; tone: 'brand' | 'danger' | 'muted' } {
  switch (status) {
    case 'APPROVED':
      return { label: '승인', tone: 'brand' };
    case 'REJECTED':
      return { label: '반려', tone: 'danger' };
    case 'PROCEEDING':
      return { label: '진행중', tone: 'muted' };
    case 'WAITING':
      return { label: '대기', tone: 'muted' };
    default:
      return { label: '임시저장', tone: 'muted' };
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
  const status = parseStatus(vacation.status);

  return (
    <View className="mt-3 px-1">
      <View className="border-border bg-surface dark:border-border-dark dark:bg-surface-dark flex w-full flex-row items-start gap-3 rounded-3xl border px-4 py-4">
        {/* icon container */}
        <View className="bg-elevated dark:bg-elevated-dark size-9 flex-none items-center justify-center rounded-xl">
          <Ionicons name="calendar" size={18} color="#1ed760" />
        </View>

        {/* body */}
        <View className="flex flex-1 flex-col gap-1.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-content dark:text-content-dark text-[15px] font-semibold">
              {parseVacationType(vacation.vacationType)}
            </Text>
            <StatusPill label={status.label} tone={status.tone} />
          </View>
          <Text className="text-muted dark:text-muted-dark text-sm" style={TABULAR}>
            {dayjs(vacation.startDate).format('YYYY-MM-DD (dd)')}
            {dayjs(vacation.startDate).isBefore(vacation.endDate) && (
              <Text> - {dayjs(vacation.endDate).format('YYYY-MM-DD (dd)')}</Text>
            )}
          </Text>
        </View>

        {/* days */}
        <View className="items-end justify-center pt-1">
          <View className="flex-row items-baseline gap-0.5">
            <Text className="text-brand text-lg font-bold" style={TABULAR}>
              {vacation.usedDays}
            </Text>
            <Text className="text-brand text-xs font-semibold">일</Text>
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
        <Text className="text-muted dark:text-muted-dark text-base font-semibold">휴가를 사용하지 않으셨군요?</Text>
      </View>
    </View>
  );
};

export default function DayoffHistoriesPage() {
  // context
  const { userinfo: userDetail } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // query
  const { vacations, reload } = useVacations({
    userUniqueId: userDetail?.sub,
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

  // mode-safe raw colors
  const contentColor = theme === 'light' ? '#15171c' : '#ffffff';

  return (
    <View className="bg-base dark:bg-base-dark flex size-full flex-col">
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="relative mb-2 flex flex-row items-center justify-center">
        <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
          <Entypo name="chevron-left" size={30} color={contentColor} />
        </TouchableOpacity>
        <Text className="text-content dark:text-content-dark text-xl font-bold">휴가 내역</Text>
      </Reanimated.View>

      {/* year + total — 숫자가 주인공, count-up */}
      <Reanimated.View entering={enterHero(80)} className="mt-4 flex-row items-end justify-between">
        <View>
          <Text className="text-muted dark:text-muted-dark text-xs font-semibold tracking-wider uppercase">
            {dayjs().format('YYYY')}년 사용 내역
          </Text>
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <Text className="text-content dark:text-content-dark text-[40px] leading-none font-bold" style={TABULAR}>
              {animatedTotal}
            </Text>
            <Text className="text-muted dark:text-muted-dark text-base font-semibold">일</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-muted dark:text-muted-dark text-[11px] font-semibold" style={TABULAR}>
            총 {newVacations.length}건
          </Text>
        </View>
      </Reanimated.View>

      {/* filter chips */}
      <Reanimated.View entering={enterPage(180)} className="mt-6 flex flex-row items-center gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = selectedVacationType === option.key;
          return (
            <AnimatedPressable
              key={option.key}
              className={cx('rounded-full px-4 py-2', isActive ? 'bg-brand' : 'bg-elevated dark:bg-elevated-dark')}
              disabled={isActive}
              onPress={() => setSelectedVacationType(option.key)}
            >
              <Text
                className={cx('text-sm font-semibold', isActive ? 'text-black' : 'text-content dark:text-content-dark')}
              >
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

import { useContext, useEffect, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useVacations } from '@/domain/documents/queries/vacations';
import { Icon } from '@/shared/components/Icon';
import { enterHero, enterListItem, enterPage } from '@/shared/components/motion/entering';
import { Badge, type BadgeVariant, Card, Segmented, usePalette } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';

import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

const VACATION_LABEL: Record<VacationType, string> = { GENERAL: '연차', COMPENSATORY: '보상휴가', OFFICIAL: '공가' };

const VACATION_BADGE: Record<VacationType, BadgeVariant> = {
  GENERAL: 'brand',
  COMPENSATORY: 'neutral',
  OFFICIAL: 'success',
};

const FILTER_OPTIONS: { value: VacationType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'GENERAL', label: '연차' },
  { value: 'COMPENSATORY', label: '보상휴가' },
  { value: 'OFFICIAL', label: '공가' },
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
      setDisplay(Math.round(eased * value * 10) / 10);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);
  return display;
}

function VacationItem({ vacation }: Readonly<{ vacation: DocumentVacation }>) {
  const start = dayjs(vacation.startDate);
  const end = dayjs(vacation.endDate);
  const half =
    vacation.vacationSubType === 'AM_HALF_DAY_OFF'
      ? ' (오전)'
      : vacation.vacationSubType === 'PM_HALF_DAY_OFF'
        ? ' (오후)'
        : '';

  return (
    <Card className="mt-3 flex-row items-center gap-3 px-4 py-3.5">
      <View className="flex-1 gap-1">
        <Badge
          label={`${VACATION_LABEL[vacation.vacationType]}${half}`}
          variant={VACATION_BADGE[vacation.vacationType]}
        />
        <Text className="text-content dark:text-content-dark text-[15px] font-semibold" style={TABULAR}>
          {start.format('M월 D일 (dd)')}
          {start.isBefore(end, 'day') ? ` – ${end.format('M월 D일 (dd)')}` : ''}
        </Text>
      </View>
      <Text className="text-brand dark:text-brand-dark text-lg font-bold" style={TABULAR}>
        {vacation.usedDays}일
      </Text>
    </Card>
  );
}

function NoVacation() {
  return (
    <View className="mt-16 w-full items-center gap-3">
      <LottieView style={{ width: 140, height: 140 }} source={NoDataLottie} autoPlay loop />
      <Text className="text-muted dark:text-muted-dark text-[15px] font-semibold">올해 사용한 휴가가 없어요</Text>
    </View>
  );
}

export default function DayoffHistoriesPage() {
  // context
  const { userinfo: userDetail } = useContext(AuthContext);

  // hooks
  const router = useRouter();
  const palette = usePalette();

  // query — 홈 빠른 실행과 같은 파라미터(같은 cache)
  const { vacations, reload } = useVacations({
    userUniqueId: userDetail?.sub,
    startDateFrom: dayjs().startOf('year').toDate(),
    endDateFrom: dayjs().endOf('year').toDate(),
    status: 'APPROVED',
    page: 0,
    size: 1000,
  });

  // state
  const [filter, setFilter] = useState<VacationType | 'ALL'>('ALL');

  const filtered = vacations
    .filter((vacation) => filter === 'ALL' || vacation.vacationType === filter)
    .sort((o1, o2) => (dayjs(o1.startDate).isBefore(o2.startDate) ? 1 : -1));

  const totalDays = filtered.reduce((current, vacation) => vacation.usedDays + current, 0);
  const animatedTotal = useCountUp(totalDays, 900);

  return (
    <View className="bg-base dark:bg-base-dark flex size-full flex-col">
      {/* header */}
      <Reanimated.View entering={enterPage(0)} className="relative mb-2 flex flex-row items-center justify-center">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          className="absolute left-0 size-11 items-start justify-center"
          onPress={() => router.back()}
        >
          <Icon sf="chevron.left" fallback="‹" size={22} weight="semibold" color={palette.content} />
        </TouchableOpacity>
        <Text className="text-content dark:text-content-dark text-xl font-bold">휴가 내역</Text>
      </Reanimated.View>

      {/* total */}
      <Reanimated.View entering={enterHero(80)} className="mt-4 flex-row items-end justify-between">
        <View>
          <Text className="text-muted dark:text-muted-dark text-[11px] font-semibold tracking-wider">
            {dayjs().format('YYYY')}년 사용
          </Text>
          <View className="mt-1 flex-row items-baseline gap-1">
            <Text className="text-content dark:text-content-dark text-[40px] leading-none font-bold" style={TABULAR}>
              {animatedTotal}
            </Text>
            <Text className="text-muted dark:text-muted-dark text-base font-semibold">일</Text>
          </View>
        </View>
        <Text className="text-muted dark:text-muted-dark text-xs" style={TABULAR}>
          총 {filtered.length}건
        </Text>
      </Reanimated.View>

      {/* filter */}
      <Reanimated.View entering={enterPage(160)} className="mt-5">
        <Segmented options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </Reanimated.View>

      {/* list */}
      <Reanimated.View entering={enterPage(220)} className="mt-1 flex-1">
        <FlashList
          data={filtered}
          refreshing={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
          renderItem={({ item, index }) => (
            <Reanimated.View entering={enterListItem(index, 220)}>
              <VacationItem vacation={item} />
            </Reanimated.View>
          )}
          ListFooterComponent={filtered.length === 0 ? <NoVacation /> : null}
          onRefresh={() => reload()}
        />
      </Reanimated.View>
    </View>
  );
}

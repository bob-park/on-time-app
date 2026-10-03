import { useContext, useMemo, useState } from 'react';

import { Pressable, ScrollView, Text, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import ScheduleEmptyState from '@/domain/documents/components/ScheduleEmptyState';
import ScheduleSkeleton from '@/domain/documents/components/ScheduleSkeleton';
import { useVacations } from '@/domain/documents/queries/vacations';
import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUser } from '@/domain/users/queries/users';
import { Icon } from '@/shared/components/Icon';
import { enterHero, enterPage } from '@/shared/components/motion/entering';
import { Badge, type BadgeVariant, Card, ListGroup, ListItem, Segmented, usePalette } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { buildMonthGrid } from '@/utils/calendar';
import { getDaysOfWeek, isSameDate } from '@/utils/parse';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

const TABULAR = { fontVariant: ['tabular-nums' as const] };

type Scope = 'mine' | 'colleague';

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: 'mine', label: '내 일정' },
  { value: 'colleague', label: '동료 일정' },
];

const VACATION_BADGE: Record<VacationType, BadgeVariant> = {
  GENERAL: 'brand',
  COMPENSATORY: 'neutral',
  OFFICIAL: 'success',
};

function includeDate(targetDate: Date, { startDate, endDate }: { startDate: Date; endDate: Date }) {
  const target = dayjs(targetDate);
  return !target.isBefore(startDate, 'day') && !target.isAfter(endDate, 'day');
}

function parseVacationName(type: VacationType, subType?: VacationSubType) {
  const name = type === 'GENERAL' ? '연차' : type === 'COMPENSATORY' ? '보상휴가' : '공가';

  if (subType === 'AM_HALF_DAY_OFF') return `${name} (오전)`;
  if (subType === 'PM_HALF_DAY_OFF') return `${name} (오후)`;
  return name;
}

function formatRange(startDate: Date, endDate: Date) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return start.isSame(end, 'day')
    ? start.format('M월 D일 (dd)')
    : `${start.format('M월 D일 (dd)')} – ${end.format('M월 D일 (dd)')}`;
}

export default function Schedule() {
  // context
  const { userinfo: userDetail } = useContext(AuthContext);

  // hooks
  const palette = usePalette();

  // state
  const [month, setMonth] = useState(() => dayjs().startOf('month').toDate());
  const [selectedDate, setSelectedDate] = useState(() => dayjs().startOf('day').toDate());
  const [scope, setScope] = useState<Scope>('mine');

  const days = useMemo(() => buildMonthGrid(month), [month]);
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));

  // queries
  const { vacations, isLoading } = useVacations({
    startDateFrom: days[0],
    endDateFrom: days[days.length - 1],
    page: 0,
    size: 500,
    status: 'APPROVED',
  });

  const scoped = useMemo(
    () => vacations.filter((v) => (scope === 'mine') === (v.userUniqueId === userDetail?.sub)),
    [vacations, scope, userDetail?.sub],
  );

  // 일정이 있는 날짜 — 달력 점 표시용
  const eventDates = useMemo(() => {
    const set = new Set<string>();
    for (const v of scoped) {
      for (let d = dayjs(v.startDate).startOf('day'); !d.isAfter(v.endDate, 'day'); d = d.add(1, 'day')) {
        set.add(d.format('YYYY-MM-DD'));
      }
    }
    return set;
  }, [scoped]);

  const selectedVacations = scoped.filter((v) => includeDate(selectedDate, v));

  // handle
  const handleMoveMonth = (offset: number) => {
    const next = dayjs(month).add(offset, 'month');
    setMonth(next.toDate());
    setSelectedDate(next.isSame(dayjs(), 'month') ? dayjs().startOf('day').toDate() : next.toDate());
  };

  const handleSelectToday = () => {
    setMonth(dayjs().startOf('month').toDate());
    setSelectedDate(dayjs().startOf('day').toDate());
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (!dayjs(date).isSame(month, 'month')) {
      setMonth(dayjs(date).startOf('month').toDate());
    }
  };

  return (
    <View className="bg-base dark:bg-base-dark flex size-full pt-[68px]">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <Reanimated.View entering={enterPage(0)} className="flex-row items-center justify-between">
          <Text className="text-content dark:text-content-dark text-[28px] font-bold tracking-tight">일정</Text>
          <View className="flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={8}
              className="size-9 items-center justify-center"
              onPress={() => handleMoveMonth(-1)}
            >
              <Icon sf="chevron.left" fallback="‹" size={14} weight="semibold" color={palette.content} />
            </Pressable>
            <Text className="text-content dark:text-content-dark text-[15px] font-semibold" style={TABULAR}>
              {dayjs(month).format('YYYY년 M월')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={8}
              className="size-9 items-center justify-center"
              onPress={() => handleMoveMonth(1)}
            >
              <Icon sf="chevron.right" fallback="›" size={14} weight="semibold" color={palette.content} />
            </Pressable>
          </View>
        </Reanimated.View>

        {/* scope */}
        <Reanimated.View entering={enterPage(60)} className="mt-3">
          <Segmented options={SCOPE_OPTIONS} value={scope} onChange={setScope} />
        </Reanimated.View>

        {/* calendar */}
        <Reanimated.View entering={enterHero(100)} className="mt-3">
          <Card className="p-3">
            <View className="flex-row">
              {Array.from({ length: 7 }, (_, i) => (
                <Text
                  key={`weekday-${i}`}
                  className={`flex-1 text-center text-[11px] font-semibold ${i === 0 ? 'text-danger dark:text-danger-dark' : 'text-muted dark:text-muted-dark'}`}
                >
                  {getDaysOfWeek(i)}
                </Text>
              ))}
            </View>
            {weeks.map((week) => (
              <View key={`week-${week[0].toISOString()}`} className="mt-1 flex-row">
                {week.map((date) => (
                  <CalendarDay
                    key={date.toISOString()}
                    date={date}
                    inMonth={dayjs(date).isSame(month, 'month')}
                    selected={isSameDate(date, selectedDate)}
                    isToday={isSameDate(date, new Date())}
                    hasEvent={eventDates.has(dayjs(date).format('YYYY-MM-DD'))}
                    onPress={handleSelectDate}
                  />
                ))}
              </View>
            ))}
          </Card>
        </Reanimated.View>

        {/* selected date list */}
        <View className="mt-5 flex-row items-center justify-between">
          <Text className="text-muted dark:text-muted-dark text-[11px] font-semibold tracking-wider">
            {dayjs(selectedDate).format('M월 D일 dddd')}
          </Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={handleSelectToday}>
            <Text className="text-brand dark:text-brand-dark text-[13px] font-semibold">오늘</Text>
          </Pressable>
        </View>

        <View className="mt-2">
          {isLoading ? (
            <ScheduleSkeleton variant={scope === 'mine' ? 'my' : 'colleague'} count={1} />
          ) : selectedVacations.length === 0 ? (
            <ScheduleEmptyState
              message={scope === 'mine' ? '선택한 날짜에 내 일정이 없어요' : '선택한 날짜에 동료 일정이 없어요'}
            />
          ) : (
            <ListGroup>
              {selectedVacations.map((v) =>
                scope === 'mine' ? (
                  <ListItem
                    key={v.id}
                    label={parseVacationName(v.vacationType, v.vacationSubType)}
                    sub={formatRange(v.startDate, v.endDate)}
                    right={<Badge label={parseVacationName(v.vacationType)} variant={VACATION_BADGE[v.vacationType]} />}
                  />
                ) : (
                  <ColleagueItem key={v.id} vacation={v} />
                ),
              )}
            </ListGroup>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function CalendarDay({
  date,
  inMonth,
  selected,
  isToday,
  hasEvent,
  onPress,
}: {
  date: Date;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  hasEvent: boolean;
  onPress: (date: Date) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dayjs(date).format('M월 D일')}
      accessibilityState={{ selected }}
      className="h-11 flex-1 items-center justify-center"
      onPress={() => onPress(date)}
    >
      <View
        className={`size-9 items-center justify-center rounded-full ${
          selected ? 'bg-brand' : isToday ? 'border-brand dark:border-brand-dark border' : ''
        }`}
      >
        <Text
          className={`text-[13px] ${
            selected
              ? 'font-bold text-white'
              : inMonth
                ? 'text-content dark:text-content-dark font-medium'
                : 'text-muted dark:text-muted-dark opacity-50'
          }`}
          style={TABULAR}
        >
          {dayjs(date).date()}
        </Text>
      </View>
      {hasEvent && !selected ? (
        <View className="bg-brand dark:bg-brand-dark absolute bottom-0.5 size-1 rounded-full" />
      ) : null}
    </Pressable>
  );
}

function ColleagueItem({ vacation }: { vacation: DocumentVacation }) {
  const { user } = useUser(vacation.userUniqueId);

  return (
    <ListItem
      left={
        <UserAvatar
          src={`${DEFAULT_API_HOST}/api/v1/users/${vacation.userUniqueId}/avatar`}
          username={user?.username}
          size="xs"
        />
      }
      label={user?.username ?? ''}
      sub={[user?.group?.name, formatRange(vacation.startDate, vacation.endDate)].filter(Boolean).join(' · ')}
      right={
        <Badge
          label={parseVacationName(vacation.vacationType, vacation.vacationSubType)}
          variant={VACATION_BADGE[vacation.vacationType]}
        />
      }
    />
  );
}

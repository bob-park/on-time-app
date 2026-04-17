import { useContext, useMemo, useRef, useState } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { usePagerView } from 'react-native-pager-view';

import ScheduleEmptyState from '@/domain/documents/components/ScheduleEmptyState';
import ScheduleSkeleton from '@/domain/documents/components/ScheduleSkeleton';
import { VACATION_COLORS } from '@/domain/documents/components/constants';
import { useVacations } from '@/domain/documents/queries/vacations';
import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUser } from '@/domain/users/queries/users';
import { Icon } from '@/shared/components/Icon';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { getDaysOfWeek, getWeekStartDate, isSameDate } from '@/utils/parse';

import cx from 'classnames';
import Reanimated from 'react-native-reanimated';

import { enterHero, enterListItem, enterPage } from '@/shared/components/motion/entering';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

// --- Utilities ---

function includeDate(targetDate: Date, { startDate, endDate }: { startDate: Date; endDate: Date }) {
  const startDay = dayjs(startDate).startOf('day');
  const endDay = dayjs(endDate).startOf('day');
  return (
    (startDay.isSame(targetDate) || startDay.isBefore(targetDate)) &&
    (endDay.isSame(targetDate) || endDay.isAfter(targetDate))
  );
}

function parseVacationName(type: VacationType, subType?: VacationSubType) {
  let name = '';
  switch (type) {
    case 'GENERAL':
      name = '연차';
      break;
    case 'COMPENSATORY':
      name = '보상휴가';
      break;
    case 'OFFICIAL':
      name = '공가';
      break;
    default:
      break;
  }

  if (subType) {
    switch (subType) {
      case 'AM_HALF_DAY_OFF':
        name += ' (오전)';
        break;
      case 'PM_HALF_DAY_OFF':
        name += ' (오후)';
        break;
      default:
        break;
    }
  }

  return name;
}

function getVacationIcon(type: VacationType) {
  switch (type) {
    case 'GENERAL':
      return { sf: 'umbrella.fill' as const, fallback: '☂' };
    case 'COMPENSATORY':
      return { sf: 'gift.fill' as const, fallback: '🎁' };
    case 'OFFICIAL':
      return { sf: 'building.2.fill' as const, fallback: '🏛' };
    default:
      return { sf: 'umbrella.fill' as const, fallback: '☂' };
  }
}

// --- WeekDayItem ---

const WeekDayItem = ({
  date,
  selected,
  isToday,
  vacationTypes,
  onPress,
}: {
  date: Date;
  selected: boolean;
  isToday: boolean;
  vacationTypes: VacationType[];
  onPress: (date: Date) => void;
}) => {
  const handlePress = () => onPress(date);

  const uniqueTypes = [...new Set(vacationTypes)].slice(0, 2);

  return (
    <TouchableOpacity
      className={cx('flex size-10 flex-col items-center justify-center rounded-full', {
        'bg-purple-500 dark:bg-purple-300': selected,
      })}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
    >
      <Text
        className={cx('text-[15px] font-semibold', {
          'text-white dark:text-gray-900': selected,
          'text-gray-900 dark:text-gray-100': !selected,
        })}
      >
        {dayjs(date).date()}
      </Text>

      {/* Vacation type dots */}
      <View className="absolute bottom-1 flex-row gap-[2px]">
        {!selected &&
          uniqueTypes.map((type, i) => (
            <View
              key={`dot-${i}`}
              className="size-[5px] rounded-full"
              style={{ backgroundColor: VACATION_COLORS[type].dot }}
            />
          ))}
        {selected &&
          uniqueTypes.map((_, i) => (
            <View key={`dot-sel-${i}`} className="size-[5px] rounded-full bg-white dark:bg-gray-900" />
          ))}
      </View>

      {/* Today ring indicator */}
      {isToday && !selected && (
        <View className="absolute inset-0 rounded-full border-2 border-purple-500 dark:border-purple-300" />
      )}
    </TouchableOpacity>
  );
};

// --- Default weeks ---

function getDefaultWeeks() {
  return [
    {
      startDate: getWeekStartDate(dayjs().startOf('day').add(-7, 'day').toDate()),
      endDate: dayjs(getWeekStartDate(dayjs().startOf('day').add(-7, 'day').toDate()))
        .add(6, 'day')
        .toDate(),
    },
    {
      startDate: getWeekStartDate(dayjs().startOf('day').toDate()),
      endDate: dayjs(getWeekStartDate(dayjs().toDate())).add(6, 'day').toDate(),
    },
    {
      startDate: getWeekStartDate(dayjs().startOf('day').add(7, 'day').toDate()),
      endDate: dayjs(getWeekStartDate(dayjs().startOf('day').add(7, 'day').toDate()))
        .add(6, 'day')
        .toDate(),
    },
  ];
}

// --- Main Schedule Page ---

export default function Schedule() {
  // ref
  const changePageRef = useRef<number>(1);

  // context
  const { userDetail } = useContext(AuthContext);

  // state
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().startOf('day').toDate());
  const [weeks, setWeeks] = useState<{ startDate: Date; endDate: Date }[]>(getDefaultWeeks);

  // queries — fetch all 3 visible weeks so prev/next pages have correct dots
  const { vacations, isLoading } = useVacations({
    startDateFrom: weeks[0].startDate,
    endDateFrom: weeks[2].endDate,
    page: 0,
    size: 100,
    status: 'APPROVED',
  });

  // hooks
  const { AnimatedPagerView, ref, ...rest } = usePagerView({ pagesAmount: 3 });

  // pre-build vacation type lookup by date string for O(1) access in week strip
  const vacationsByDate = useMemo(() => {
    const map = new Map<string, VacationType[]>();
    for (const v of vacations) {
      let cur = dayjs(v.startDate).startOf('day');
      const end = dayjs(v.endDate).startOf('day');
      while (cur.isSame(end) || cur.isBefore(end)) {
        const key = cur.format('YYYY-MM-DD');
        const arr = map.get(key);
        if (arr) {
          arr.push(v.vacationType);
        } else {
          map.set(key, [v.vacationType]);
        }
        cur = cur.add(1, 'day');
      }
    }
    return map;
  }, [vacations]);

  // handle
  const handlePrevWeeks = () => {
    const startDate = getWeekStartDate(dayjs(weeks[0].startDate).add(-1, 'day').toDate());
    setWeeks([{ startDate, endDate: dayjs(startDate).add(6, 'day').toDate() }, weeks[0], weeks[1]]);
    setSelectedDate(dayjs(startDate).add(7, 'day').toDate());
  };

  const handleNextWeeks = () => {
    const startDate = getWeekStartDate(dayjs(weeks[2].endDate).add(1, 'day').toDate());
    setWeeks([weeks[1], weeks[2], { startDate, endDate: dayjs(startDate).add(6, 'day').toDate() }]);
    setSelectedDate(dayjs(startDate).add(-7, 'day').toDate());
  };

  const handleSelectToday = () => {
    setWeeks(getDefaultWeeks());
    setSelectedDate(dayjs().startOf('day').toDate());
  };

  // filtered vacations
  const myVacations = useMemo(
    () =>
      vacations.filter(
        (v) =>
          v.userUniqueId === userDetail?.id &&
          includeDate(selectedDate, { startDate: v.startDate, endDate: v.endDate }),
      ),
    [vacations, selectedDate, userDetail?.id],
  );

  const colleagueVacations = useMemo(
    () =>
      vacations.filter(
        (v) =>
          v.userUniqueId !== userDetail?.id &&
          includeDate(selectedDate, { startDate: v.startDate, endDate: v.endDate }),
      ),
    [vacations, selectedDate, userDetail?.id],
  );

  return (
    <View className="flex size-full flex-col bg-gray-50 pt-[68px] dark:bg-gray-950">
      {/* Header */}
      <Reanimated.View entering={enterPage(0)} className="px-4 pb-3">
        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          일정
        </Text>
        <View className="mt-1 flex-row items-end justify-between">
          <Text className="text-[28px] font-bold leading-none text-gray-900 dark:text-white">
            {dayjs(selectedDate).format('YYYY년 M월')}
          </Text>
          <TouchableOpacity
            className="h-9 items-center justify-center rounded-full bg-purple-100 px-4 dark:bg-purple-900/40"
            onPress={handleSelectToday}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-bold text-purple-600 dark:text-purple-300">오늘</Text>
          </TouchableOpacity>
        </View>
      </Reanimated.View>

      {/* Week Calendar Strip - M3 Surface */}
      <Reanimated.View entering={enterHero(100)} className="mt-2 px-4">
        <View
          className="rounded-[20px] bg-white pb-2 pt-3 dark:bg-gray-900"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="h-[88px]">
            <AnimatedPagerView
              {...rest}
              className="h-full"
              style={{ flex: 1 }}
              ref={ref}
              initialPage={1}
              layoutDirection="ltr"
              pageMargin={3}
              orientation="horizontal"
              onPageScrollStateChanged={(e) => {
                if (e.nativeEvent.pageScrollState !== 'idle') return;
                ref.current?.setPageWithoutAnimation(1);
                if (changePageRef.current === 0) handlePrevWeeks();
                if (changePageRef.current === 2) handleNextWeeks();
              }}
              onPageSelected={(e) => {
                changePageRef.current = e.nativeEvent.position;
              }}
            >
              {useMemo(
                () =>
                  weeks.map((week, pageIndex) => (
                    <View
                      key={`weeks-page-${pageIndex}`}
                      className="flex w-full flex-row items-center justify-around px-2"
                      collapsable={false}
                    >
                      {new Array(7).fill('*').map((_, index) => {
                        const date = dayjs(weeks[pageIndex].startDate).add(index, 'day');
                        const dateObj = date.toDate();
                        const dayOfWeek = date.day();

                        const vacationTypesForDay = vacationsByDate.get(date.format('YYYY-MM-DD')) ?? [];

                        return (
                          <View key={`schedule-item-${pageIndex}-${index}`} className="w-10 items-center gap-1">
                            <Text
                              className={cx('text-[11px] font-semibold', {
                                'text-red-400': dayOfWeek === 0,
                                'text-blue-400': dayOfWeek === 6,
                                'text-gray-400 dark:text-gray-500': ![0, 6].includes(dayOfWeek),
                              })}
                            >
                              {getDaysOfWeek(dayOfWeek)}
                            </Text>
                            <WeekDayItem
                              date={dateObj}
                              selected={isSameDate(selectedDate, dateObj)}
                              isToday={isSameDate(dayjs().startOf('day').toDate(), dateObj)}
                              vacationTypes={vacationTypesForDay}
                              onPress={(d) => setSelectedDate(d)}
                            />
                          </View>
                        );
                      })}
                    </View>
                  )),
                [weeks, selectedDate, vacationsByDate],
              )}
            </AnimatedPagerView>
          </View>

          {/* Swipe indicator */}
          <View className="items-center pb-1 pt-2">
            <View className="h-1 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          </View>
        </View>
      </Reanimated.View>

      {/* Schedule Content */}
      <ScrollView
        className="mt-6 flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 내 일정 */}
        <View className="mb-8">
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              내 일정
            </Text>
            <View className="rounded-full bg-purple-100 px-2 py-0.5 dark:bg-purple-900/40">
              <Text className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                {isLoading ? '-' : myVacations.length}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ScheduleSkeleton variant="my" count={1} />
          ) : myVacations.length === 0 ? (
            <ScheduleEmptyState message="선택한 날짜에 내 일정이 없습니다" />
          ) : (
            <View className="gap-3">
              {myVacations.map((vacation, i) => (
                <Reanimated.View key={`my-schedule-${vacation.id}`} entering={enterListItem(i)}>
                  <MyVacationCard vacation={vacation} />
                </Reanimated.View>
              ))}
            </View>
          )}
        </View>

        {/* 동료 일정 */}
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              동료 일정
            </Text>
            <View className="rounded-full bg-purple-100 px-2 py-0.5 dark:bg-purple-900/40">
              <Text className="text-[11px] font-bold text-purple-600 dark:text-purple-300">
                {isLoading ? '-' : colleagueVacations.length}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ScheduleSkeleton variant="colleague" count={2} />
          ) : colleagueVacations.length === 0 ? (
            <ScheduleEmptyState message="선택한 날짜에 동료 일정이 없습니다" />
          ) : (
            <View className="gap-3">
              {colleagueVacations.map((item, i) => (
                <Reanimated.View key={`colleague-${item.id}`} entering={enterListItem(i)}>
                  <ColleagueScheduleCard
                    userUniqueId={item.userUniqueId}
                    type={item.vacationType}
                    subType={item.vacationSubType}
                    startDate={item.startDate}
                    endDate={item.endDate}
                  />
                </Reanimated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// --- My Vacation Card ---

function MyVacationCard({ vacation }: { vacation: DocumentVacation }) {
  const colors = VACATION_COLORS[vacation.vacationType];
  const icon = getVacationIcon(vacation.vacationType);

  return (
    <View
      className="flex-row items-center gap-4 rounded-2xl bg-white p-4 dark:bg-gray-900"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Icon tile — type identity comes from the tile, not a stripe */}
      <View className={cx('size-12 items-center justify-center rounded-2xl', colors.bg, colors.darkBg)}>
        <Icon sf={icon.sf} fallback={icon.fallback} size={22} color={colors.iconColor} />
      </View>

      {/* Info */}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-bold text-gray-900 dark:text-gray-100">
            {parseVacationName(vacation.vacationType)}
          </Text>
          {vacation.vacationSubType && (
            <View className={cx('rounded-md px-1.5 py-0.5', colors.badgeBg)}>
              <Text className={cx('text-xs font-bold', colors.badgeText)}>
                {vacation.vacationSubType === 'AM_HALF_DAY_OFF'
                  ? '오전'
                  : vacation.vacationSubType === 'PM_HALF_DAY_OFF'
                    ? '오후'
                    : vacation.vacationSubType}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {dayjs(vacation.startDate).format('YYYY-MM-DD')} ({getDaysOfWeek(dayjs(vacation.startDate).day())})
          {dayjs(vacation.startDate).isBefore(vacation.endDate) &&
            ` - ${dayjs(vacation.endDate).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(vacation.endDate).day())})`}
        </Text>
      </View>
    </View>
  );
}

// --- Colleague Schedule Card ---

function ColleagueScheduleCard({
  userUniqueId,
  type,
  subType,
  startDate,
  endDate,
}: Readonly<{
  userUniqueId: string;
  type: VacationType;
  subType?: VacationSubType;
  startDate: Date;
  endDate: Date;
}>) {
  const { user } = useUser(userUniqueId);
  const colors = VACATION_COLORS[type];

  if (!user) return null;

  return (
    <View
      className="flex-row items-center gap-4 rounded-2xl bg-white p-4 dark:bg-gray-900"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Avatar */}
      <View className="size-14 flex-none">
        <UserAvatar
          src={`${DEFAULT_API_HOST}/api/v1/users/${userUniqueId}/avatar`}
          username={user?.username}
          size="sm"
        />
      </View>

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">{user?.username || ''}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {user?.group?.name} · {user?.position?.name || ''}
        </Text>
        <Text className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
          {dayjs(startDate).format('YYYY-MM-DD')} ({getDaysOfWeek(dayjs(startDate).day())})
          {dayjs(startDate).isBefore(endDate) &&
            ` - ${dayjs(endDate).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(endDate).day())})`}
        </Text>
      </View>

      {/* Type badge */}
      <View className={cx('rounded-lg px-2.5 py-1', colors.badgeBg)}>
        <Text className={cx('text-xs font-bold', colors.badgeText)}>{parseVacationName(type, subType)}</Text>
      </View>
    </View>
  );
}

import { useContext, useEffect, useMemo, useState } from 'react';

import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { usePagerView } from 'react-native-pager-view';
import { OnPageSelectedEventData } from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent';
import uuid from 'react-native-uuid';

import { Fontisto, Octicons } from '@expo/vector-icons';

import { useVacations } from '@/domain/documents/queries/vacations';
import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUser } from '@/domain/users/queries/users';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { getDaysOfWeek, getWeekStartDate, isSameDate } from '@/utils/parse';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

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
    case 'GENERAL': {
      name = '연차';
      break;
    }
    case 'COMPENSATORY': {
      name = '보상휴가';
      break;
    }
    case 'OFFICIAL': {
      name = '공가';
      break;
    }
    default:
      break;
  }

  if (subType) {
    switch (subType) {
      case 'AM_HALF_DAY_OFF': {
        name += ' (오전)';
        break;
      }
      case 'PM_HALF_DAY_OFF': {
        name += ' (오후)';
        break;
      }
      default:
        break;
    }
  }

  return name;
}

const WeekDayItem = ({
  date,
  today,
  todo = false,
  onPress,
}: {
  date: Date;
  today: boolean;
  todo?: boolean;
  onPress: (date: Date) => void;
}) => {
  // context
  const { theme } = useContext(ThemeContext);

  // handle
  const handlePress = () => {
    onPress(date);
  };

  return (
    <TouchableOpacity
      className={cx('flex h-11 w-full flex-col items-center justify-center rounded-lg', {
        'bg-gray-900 dark:bg-gray-100': today,
      })}
      disabled={today}
      onPress={handlePress}
    >
      <Text
        className={cx(
          'text-lg font-bold',
          today ? 'text-gray-300 dark:text-gray-800' : 'text-gray-800 dark:text-gray-300',
        )}
      >
        {dayjs(date).date()}
      </Text>
      <View className="-mt-1 h-3 w-full items-center justify-center">
        {todo && (
          <Octicons
            name="dot-fill"
            size={10}
            color={theme === 'light' ? (today ? 'white' : 'black') : today ? 'black' : 'white'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const defaultWeeks = [
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

export default function Schedule() {
  // context
  const { userDetail } = useContext(AuthContext);

  // state
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().startOf('day').toDate());
  const [weeks, setWeeks] = useState<{ startDate: Date; endDate: Date }[]>(defaultWeeks);

  // queries
  const { vacations } = useVacations({
    startDateFrom: weeks[1].startDate,
    endDateFrom: weeks[1].endDate,
    page: 0,
    size: 100,
    status: 'APPROVED',
  });

  // hooks
  const { AnimatedPagerView, ref, ...rest } = usePagerView({ pagesAmount: 3 });

  // useEffect
  useEffect(() => {}, [rest.activePage]);

  // handle
  const handlePageSelected = (e: OnPageSelectedEventData) => {
    const position = e.position;

    if (position === 0) {
      handlePrevWeeks();
    } else if (position === 2) {
      handleNextWeeks();
    }
  };

  const handlePrevWeeks = () => {
    const startDate = getWeekStartDate(dayjs(weeks[0].startDate).add(-1, 'day').toDate());

    setWeeks([
      {
        startDate,
        endDate: dayjs(startDate).add(6, 'day').toDate(),
      },
      weeks[0],
      weeks[1],
    ]);

    setSelectedDate(dayjs(startDate).add(7, 'day').toDate());
  };

  const handleNextWeeks = () => {
    const startDate = getWeekStartDate(dayjs(weeks[2].endDate).add(1, 'day').toDate());

    setWeeks([
      weeks[1],
      weeks[2],
      {
        startDate,
        endDate: dayjs(startDate).add(6, 'day').toDate(),
      },
    ]);

    setSelectedDate(dayjs(startDate).add(-7, 'day').toDate());
  };
  const handleSelectToday = () => {
    setWeeks(defaultWeeks);

    setSelectedDate(dayjs().startOf('day').toDate());
  };

  return (
    <View className="flex size-full flex-col items-center bg-gray-50 px-4 pb-[360px] pt-2 dark:bg-gray-950">
      {/* headers */}
      <View className="mt-3 w-full px-2">
        <View className="flex flex-row items-center justify-between gap-4">
          <View className="">
            <View className="flex flex-row items-center justify-center gap-5">
              <View className="">
                <Text className="text-2xl font-bold dark:text-white">{dayjs(selectedDate).format('YYYY년 MM월')}</Text>
              </View>
            </View>
          </View>

          <View>
            <TouchableOpacity
              className="h-8 w-14 flex-none items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700"
              onPress={handleSelectToday}
            >
              <Text className="font-bold text-gray-700 dark:text-gray-100">오늘</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* weeks */}
      <SafeAreaView className="mt-5 h-28 w-full">
        <View className="h-24">
          <SafeAreaView className="" style={{ flex: 1 }}>
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
                if (e.nativeEvent.pageScrollState === 'idle') {
                  ref.current.setPageWithoutAnimation(1);
                }
              }}
              onPageSelected={(e) => handlePageSelected(e.nativeEvent)}
            >
              {useMemo(
                () =>
                  weeks.map((week, pageIndex) => (
                    <View
                      key={`weeks-page-${pageIndex}`}
                      className="flex w-full flex-row items-center justify-center gap-3"
                      collapsable={false}
                    >
                      {new Array(7).fill('*').map((_, index) => (
                        <View
                          key={`schedule-item-${pageIndex}-${index}`}
                          className="flex w-12 flex-col items-center justify-center gap-2"
                        >
                          <View className="w-full items-center justify-center">
                            <Text
                              className={cx('font-bold', {
                                'text-blue-400': dayjs(weeks[pageIndex].startDate).add(index, 'day').day() === 6,
                                'text-red-400': dayjs(weeks[pageIndex].startDate).add(index, 'day').day() === 0,
                                'text-gray-400 dark:text-gray-300': ![0, 6].includes(
                                  dayjs(weeks[pageIndex].startDate).add(index, 'day').day(),
                                ),
                              })}
                            >
                              {getDaysOfWeek(dayjs(weeks[pageIndex].startDate).add(index, 'day').day())}
                            </Text>
                          </View>

                          <WeekDayItem
                            date={dayjs(weeks[pageIndex].startDate).add(index, 'day').toDate()}
                            today={isSameDate(
                              selectedDate,
                              dayjs(weeks[pageIndex].startDate).add(index, 'day').toDate(),
                            )}
                            todo={vacations.some((vacation) =>
                              includeDate(dayjs(weeks[pageIndex].startDate).add(index, 'day').toDate(), {
                                startDate: vacation.startDate,
                                endDate: vacation.endDate,
                              }),
                            )}
                            onPress={(date) => setSelectedDate(date)}
                          />
                        </View>
                      ))}
                    </View>
                  )),
                [weeks, selectedDate, vacations],
              )}
            </AnimatedPagerView>
          </SafeAreaView>
        </View>

        <View className="absolute bottom-0 flex w-full flex-col items-center justify-center gap-3">
          <View className="h-[6px] w-24 rounded-2xl bg-gray-200"></View>
        </View>
      </SafeAreaView>

      {/* 일정 */}
      <View className="mt-3 flex size-full flex-col items-center gap-2">
        {/* 내 일정 */}
        <View className="flex w-full flex-col items-center gap-3 rounded-2xl border-t-[2px] border-gray-100 px-3 pt-3 dark:border-gray-700">
          <View className="flex w-full flex-row items-center gap-3">
            <Text className="text-base font-bold text-gray-400 dark:text-gray-500">내 일정</Text>
            <Text className="font-extrabold text-blue-600 dark:text-blue-400">
              {
                vacations.filter(
                  (vacation) =>
                    vacation.userUniqueId === userDetail?.id &&
                    includeDate(selectedDate, { startDate: vacation.startDate, endDate: vacation.endDate }),
                ).length
              }
            </Text>
          </View>

          <View className="ml-4 flex min-h-24 w-full flex-col items-center gap-3">
            {vacations
              .filter(
                (vacation) =>
                  vacation.userUniqueId === userDetail?.id &&
                  includeDate(selectedDate, { startDate: vacation.startDate, endDate: vacation.endDate }),
              )
              .map((vacation) => (
                <View
                  key={`my-schedules-item-${uuid.v4()}`}
                  className="m-2 flex w-full flex-row items-center justify-center gap-3"
                >
                  <View className="flex size-16 flex-none flex-col items-center justify-center rounded-2xl bg-violet-500">
                    <Fontisto name="parasol" size={24} color="white" />
                  </View>

                  <View className="flex flex-1 flex-col items-center gap-2">
                    <View className="w-full">
                      <Text className="text-lg font-bold text-gray-600 dark:text-gray-300">
                        {parseVacationName(vacation.vacationType, vacation.vacationSubType)}
                      </Text>
                    </View>
                    <View className="flex w-full flex-row items-center gap-2">
                      <Text className="font-semibold text-gray-500">
                        <Text className="">{dayjs(vacation.startDate).format('YYYY-MM-DD')}</Text>
                        <Text className="">({getDaysOfWeek(dayjs(vacation.startDate).day())})</Text>
                      </Text>
                      {dayjs(vacation.startDate).isBefore(vacation.endDate) && (
                        <>
                          <Text className="font-semibold text-gray-500">-</Text>
                          <Text className="font-semibold text-gray-500">
                            <Text className="">{dayjs(vacation.endDate).format('YYYY-MM-DD')}</Text>
                            <Text className="">({getDaysOfWeek(dayjs(vacation.endDate).day())})</Text>
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* 동료 일정 */}
        <View className="mt-3 flex w-full flex-col items-center gap-3 border-t-[2px] border-gray-100 px-3 pt-3 dark:border-gray-700">
          <View className="flex w-full flex-row items-center gap-3">
            <Text className="text-base font-bold text-gray-400 dark:text-gray-500">동료 일정</Text>
            <Text className="font-extrabold text-blue-600 dark:text-blue-400">
              {
                vacations.filter(
                  (vacation) =>
                    vacation.userUniqueId !== userDetail?.id &&
                    includeDate(selectedDate, { startDate: vacation.startDate, endDate: vacation.endDate }),
                ).length
              }
            </Text>
          </View>

          <SafeAreaView className="size-full">
            <FlashList
              className="w-full"
              data={vacations.filter(
                (vacation) =>
                  vacation.userUniqueId !== userDetail?.id &&
                  includeDate(selectedDate, { startDate: vacation.startDate, endDate: vacation.endDate }),
              )}
              renderItem={({ item, index }) => (
                <ColleagueSchedule
                  userUniqueId={item.userUniqueId}
                  type={item.vacationType}
                  subType={item.vacationSubType}
                  startDate={item.startDate}
                  endDate={item.endDate}
                />
              )}
              onRefresh={() => {}}
            />
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

const ColleagueSchedule = ({
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
}>) => {
  // queries
  const { user } = useUser(userUniqueId);

  if (!user) {
    return null;
  }

  return (
    <View className="m-2 flex w-full flex-row items-center gap-3">
      <View className="size-16 flex-none">
        <UserAvatar
          src={`${DEFAULT_API_HOST}/api/v1/users/${userUniqueId}/avatar`}
          username={user?.username}
          size="sm"
        />
      </View>

      <View className="flex flex-1 flex-col items-center gap-1">
        <View className="w-full">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-300">{user?.username || ''}</Text>
            <Text className="text-lg font-bold text-gray-600 dark:text-gray-300">
              {parseVacationName(type, subType)}
            </Text>
          </View>
        </View>
        <View className="w-full">
          <Text className="w-full text-sm dark:text-gray-400">
            <Text>{user?.group?.name}</Text>
            <Text> - </Text>
            <Text>{user?.position?.name || ''}</Text>
          </Text>
        </View>
        <View className="flex w-full flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            <Text className="">{dayjs(startDate).format('YYYY-MM-DD')}</Text>
            <Text className="">({getDaysOfWeek(dayjs(startDate).day())})</Text>
          </Text>
          {dayjs(startDate).isBefore(endDate) && (
            <>
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">-</Text>
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                <Text className="">{dayjs(endDate).format('YYYY-MM-DD')}</Text>
                <Text className="">({getDaysOfWeek(dayjs(endDate).day())})</Text>
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

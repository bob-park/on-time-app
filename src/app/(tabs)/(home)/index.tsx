import { useContext, useEffect, useState } from 'react';

import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import * as Device from 'expo-device';
import { useRouter } from 'expo-router';

import { FontAwesome, FontAwesome5, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import dayjs from '@/shared/dayjs';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDaysOfWeek, getDuration, parseTimeFormat } from '@/utils/parse';
import { TimeCode } from '@/utils/timecode/TimeCode';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';

const WEEKEND_DAYS = [0, 6];
const ONE_HOUR = 3_600;

export default function HomeIndex() {
  // context
  const { theme } = useContext(ThemeContext);
  const { notifications } = useContext(NotificationContext);

  // query
  const { today, reloadToday } = useTodayAttendance();

  // state
  const [remainingTime, setRemainingTime] = useState<{ isOvertime: boolean; time: TimeCode | false }>({
    isOvertime: false,
    time: false,
  });

  const workDurations = today?.clockInTime && today?.clockOutTime && getDuration(today.clockInTime, today.clockOutTime);

  // hooks
  const router = useRouter();

  // useEffect
  useEffect(() => {
    calculateRemainingTime();

    const intervalId = setInterval(() => {
      calculateRemainingTime();
    }, 1_000);

    return () => {
      intervalId && clearInterval(intervalId);
    };
  }, [today]);

  // handle
  const handleRefreshToday = () => {
    reloadToday();
  };

  const calculateRemainingTime = () => {
    const remainingTime = {
      isOvertime: dayjs(today?.leaveWorkAt).unix() - dayjs().unix() < 0,
      time: !!today?.leaveWorkAt && new TimeCode(Math.abs(dayjs(today?.leaveWorkAt).unix() - dayjs().unix())),
    };

    setRemainingTime(remainingTime);
  };

  return (
    <View className="flex size-full flex-col items-center gap-4">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center justify-between gap-3">
          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-xl font-bold dark:text-white">{dayjs().format('MM월 DD일')}</Text>
            <Text
              className={cx('text-base font-bold', {
                'text-black dark:text-white': !WEEKEND_DAYS.includes(dayjs().day()),
                'text-blue-500 dark:text-blue-300': dayjs().day() === 6,
                'text-red-600 dark:text-red-300': dayjs().day() === 0,
              })}
            >
              ({getDaysOfWeek(dayjs().day())})
            </Text>
          </View>

          {/* notification */}
          <TouchableOpacity
            className="relative items-center justify-between"
            onPress={() => router.push('./notifications')}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme === 'light' ? 'black' : 'white'} />

            {notifications.some((notification) => !notification.isRead) && (
              <View className="absolute right-0 top-0 flex size-4 flex-col items-center justify-center rounded-full bg-white dark:bg-black">
                <View className="size-2 rounded-full bg-red-500"></View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* search */}
      <View className="w-full">
        <View
          className={cx(
            'flex w-full flex-row items-center gap-2 rounded-xl border-[1px] border-gray-50 bg-gray-50 px-3 dark:border-gray-900 dark:bg-gray-900',
          )}
        >
          <Ionicons name="search" size={24} color="gray" />
          <TextInput
            className={cx('items-center text-sm dark:text-white', {
              'h-12': Device.osName !== 'iOS',
              'my-2 h-8': Device.osName === 'iOS',
            })}
            numberOfLines={1}
            placeholder="찾는게 있으신가요?"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* action button */}
      <View className="w-full">
        <ScrollView className="h-16" horizontal>
          <TouchableOpacity
            className="mr-2 flex h-12 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3 dark:bg-gray-900"
            onPress={() => router.push('./attendance')}
          >
            <MaterialIcons name="timer" size={24} color="#34d399" />
            <Text className="text-sm font-bold dark:text-white">근무 입력</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mr-2 flex h-12 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3 dark:bg-gray-900"
            onPress={() => router.push('./dayoff/add')}
          >
            <Fontisto name="parasol" size={20} color="#f0abfc" />
            <Text className="text-sm font-bold dark:text-white">휴가 신청</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mr-2 flex h-12 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3 dark:bg-gray-900"
            onPress={() => router.push('./dayoff/histories')}
          >
            <FontAwesome name="history" size={20} color="#2563eb" />
            <Text className="text-sm font-bold dark:text-white">휴가 내역</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg- flex h-12 flex-row items-center justify-center gap-3 rounded-xl bg-gray-50 px-5 py-3 dark:bg-gray-900">
            <MaterialIcons name="work" size={24} color="#6b7280" />
            <Text className="text-sm font-bold dark:text-white">근무 확인</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 내 근무 */}
      <View className="size-full">
        <FlashList
          className="w-full"
          data={new Array(1).fill('*')}
          onRefresh={handleRefreshToday}
          renderItem={() => (
            <View className="flex flex-col items-center gap-3">
              <View className="flex w-full flex-row items-center gap-2">
                <Text className="text-base font-bold text-gray-400 dark:text-gray-500">내 근무</Text>
                {today?.workType && (
                  <Text className="text-sm">
                    <Text className="font-semibold">(</Text>
                    {today.workType === 'HOME' && <Text className="font-semibold">재택 근무</Text>}
                    {today.workType === 'OFFICE' && <Text className="font-semibold">사무실</Text>}
                    {today.workType === 'OUTSIDE' && <Text className="font-semibold">외근</Text>}
                    <Text className="font-semibold">)</Text>
                  </Text>
                )}
              </View>

              <View className="w-full rounded-xl bg-gray-50 px-6 py-4 dark:bg-gray-900">
                <View className="flex flex-col items-center gap-6">
                  {/* 출근 시간 */}
                  <View className="w-full border-b-[1px] border-b-white dark:border-b-black">
                    <View className="flex h-12 flex-row items-center justify-between gap-4">
                      <View className="">
                        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">출근 시간</Text>
                      </View>
                      <View className="flex flex-row items-end gap-2">
                        {today?.clockInTime ? (
                          <>
                            {dayjs(today.clockInTime).hour() > 11 && (
                              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">오후</Text>
                            )}
                            <Text className="text-base font-semibold dark:text-white">
                              {dayjs(today.clockInTime).format('hh시 mm분')}
                            </Text>
                          </>
                        ) : (
                          <Text className="text-lg font-semibold dark:text-white">출근 전</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* 목표 퇴근 시간 */}
                  <View className="w-full border-b-[1px] border-b-white dark:border-b-black">
                    <View className="flex h-12 flex-row items-center justify-between gap-4">
                      <View className="flex flex-row items-center gap-3">
                        <Ionicons name="rocket" size={16} color="#10b981" />
                        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">목표 퇴근 시간</Text>
                      </View>
                      <View className="flex flex-row items-end gap-2">
                        {today?.leaveWorkAt && (
                          <>
                            {dayjs(today.leaveWorkAt).hour() > 11 && (
                              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">오후</Text>
                            )}
                            <Text className="text-base font-semibold dark:text-white">
                              {dayjs(today.leaveWorkAt).format('hh시 mm분')}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* 퇴근 시간 or 남은 시간 */}
                  {today?.clockOutTime ? (
                    <View className="w-full border-b-[1px] border-b-white dark:border-b-black">
                      <View className="flex h-12 flex-row items-center justify-between gap-4">
                        <View className="flex flex-row items-center gap-3">
                          <FontAwesome5 name="running" size={16} color={theme === 'light' ? 'black' : 'white'} />
                          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">퇴근 시간</Text>
                        </View>
                        <View className="flex flex-row items-end gap-2">
                          {dayjs(today.clockOutTime).hour() > 11 && (
                            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">오후</Text>
                          )}
                          <Text className="text-base font-semibold dark:text-white">
                            {dayjs(today.clockOutTime).format('hh시 mm분')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="w-full border-b-[1px] border-b-white dark:border-b-black">
                      <View className="flex h-12 flex-row items-center justify-between gap-4">
                        <View className="flex flex-row items-center gap-3">
                          <FontAwesome5 name="running" size={16} color={theme === 'light' ? 'black' : 'white'} />
                          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">남은 시간</Text>
                        </View>
                        {remainingTime.time && (
                          <View className="flex flex-row items-end gap-2">
                            {remainingTime.isOvertime && (
                              <Text className="text-base font-semibold dark:text-white">+</Text>
                            )}
                            <Text className="text-base font-semibold dark:text-white">
                              {remainingTime.time.formatHours}시간
                            </Text>
                            <Text className="text-base font-semibold dark:text-white">
                              {remainingTime.time.formatMinutes}분
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* 총 근무 시간 */}
                  <View className="w-full">
                    <View className="flex h-12 flex-row items-center justify-between gap-4">
                      <View className="flex flex-row items-center gap-3">
                        <FontAwesome5 name="business-time" size={12} color={theme === 'light' ? 'black' : 'white'} />
                        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">총 근무 시간</Text>
                      </View>
                      <View className="flex flex-row items-end gap-2">
                        <Text className="text-base font-semibold dark:text-white">
                          {workDurations &&
                            parseTimeFormat(
                              workDurations -
                                (workDurations > ONE_HOUR * 8 ||
                                isIncludeTime(
                                  {
                                    from: today?.clockInTime || dayjs(today?.workingDate).hour(0).toDate(),
                                    to: today?.clockOutTime || dayjs(today?.workingDate).hour(0).toDate(),
                                  },
                                  dayjs(today?.workingDate).hour(12).toDate(),
                                )
                                  ? ONE_HOUR
                                  : 0),
                            )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

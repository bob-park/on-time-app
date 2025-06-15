import { useContext, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';

import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { useUserLeaveEntry } from '@/domain/users/queries/users';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';
import dayjs from 'dayjs';

export default function AddDayOff() {
  // context
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  // queries
  const { leaveEntry } = useUserLeaveEntry({ uniqueId: user?.uniqueId, year: dayjs().year() });

  // state
  const remainingDays = (leaveEntry?.totalLeaveDays || 0) - (leaveEntry?.usedLeaveDays || 0);
  const remainingCompDays = (leaveEntry?.totalCompLeaveDays || 0) - (leaveEntry?.usedCompLeaveDays || 0);

  const [selectedDate, setSelectedDate] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf('day').toDate(),
    endDate: dayjs().startOf('day').toDate(),
  });

  // hooks
  const router = useRouter();
  const defaultStyles = useDefaultStyles();

  return (
    <View className="flex size-full flex-col items-center px-4 py-2">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center gap-4">
          {/* backward */}
          <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
          </TouchableOpacity>

          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-xl font-bold dark:text-white">휴가 신청</Text>
          </View>
        </View>
      </View>

      {/* contents */}
      <View className="mt-2 w-full">
        <View className="flex flex-col items-center justify-center gap-2">
          {/* 연차 */}
          <View className="flex w-full flex-row items-center justify-between gap-6 rounded-xl bg-gray-50 px-4 py-4">
            <View className="mx-4">
              <Text className="text-xs font-semibold text-gray-500">전체 휴가</Text>
              <Text className="text-lg font-extrabold">{leaveEntry?.totalLeaveDays}</Text>
            </View>
            <View className="mx-4">
              <Text className="text-xs font-semibold text-gray-500">사용 개수</Text>
              <Text className="text-lg font-extrabold">{leaveEntry?.usedLeaveDays}</Text>
            </View>
            <View className="mx-4">
              <Text className="text-xs font-semibold text-gray-500">남은 개수</Text>
              <Text
                className={cx('text-lg font-extrabold', {
                  'text-amber-600':
                    remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.3 &&
                    remainingDays < (leaveEntry?.totalLeaveDays || 0) * 0.5,
                  'text-red-600': remainingDays < (leaveEntry?.totalLeaveDays || 0) * 0.3,
                })}
              >
                {remainingDays}
              </Text>
            </View>
          </View>

          {/* 보상 휴가 */}
          <View className="flex w-full flex-row items-center justify-between gap-6 rounded-xl bg-gray-50 px-4 py-4">
            <View className="mx-4">
              <Text className="text-xs font-semibold text-gray-500">보상 휴가</Text>
              <Text className="text-lg font-extrabold">{leaveEntry?.totalCompLeaveDays}</Text>
            </View>
            <View className="mx-4">
              <Text className="text-xs font-semibold text-gray-500">사용 개수</Text>
              <Text className="text-lg font-extrabold">{leaveEntry?.usedCompLeaveDays}</Text>
            </View>
            <View className="mx-4">
              <Text className="text-xs font-semibold text-gray-500">남은 개수</Text>
              <Text
                className={cx('text-lg font-extrabold', {
                  'text-amber-600':
                    remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.3 &&
                    remainingCompDays < (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                  'text-red-600': remainingCompDays < (leaveEntry?.totalCompLeaveDays || 0) * 0.3,
                })}
              >
                {remainingCompDays}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* selected date picker */}
      <View className="mt-2 w-full">
        <DateTimePicker
          mode="range"
          locale="ko"
          startDate={selectedDate.startDate}
          endDate={selectedDate.endDate}
          onChange={({ startDate, endDate }) =>
            setSelectedDate({ startDate: dayjs(startDate).toDate(), endDate: dayjs(endDate).toDate() })
          }
          styles={{
            ...defaultStyles,
            today: { backgroundColor: 'white', borderColor: 'blue', borderWidth: 1, borderRadius: '100%' },
            selected: { backgroundColor: 'blue', borderRadius: '100%' },
          }}
        />
      </View>
    </View>
  );
}

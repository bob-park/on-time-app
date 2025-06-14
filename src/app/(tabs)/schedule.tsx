import { useContext, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';

import { Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { getDaysOfWeek, getWeekStartDate, isSameDate } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';

function resetWeek() {
  const baseStartDate = getWeekStartDate(dayjs().startOf('day').toDate());

  return {
    startDate: baseStartDate,
    endDate: dayjs(baseStartDate).add(6, 'day').toDate(),
  };
}

const WeekDayItem = ({ date, today, onPress }: { date: Date; today: boolean; onPress: (date: Date) => void }) => {
  // handle
  const handlePress = () => {
    onPress(date);
  };

  return (
    <TouchableOpacity
      className={cx('h-9 w-full items-center justify-center rounded-lg', {
        'bg-gray-900': today,
      })}
      disabled={today}
      onPress={handlePress}
    >
      <Text className={cx('text-lg font-bold', today ? 'text-gray-300' : 'text-gray-800')}>{dayjs(date).date()}</Text>
    </TouchableOpacity>
  );
};

export default function Schedule() {
  // context
  const { theme } = useContext(ThemeContext);

  // state
  const [week, setWeek] = useState<{ startDate: Date; endDate: Date }>(() => resetWeek());
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().startOf('day').toDate());

  // useEffect

  // handle
  const handleSelectToday = () => {
    setWeek(resetWeek());
    setSelectedDate(dayjs().startOf('day').toDate());
  };

  const handlePrevWeek = () => {
    const startDate = dayjs(week.startDate).add(-7, 'day').toDate();

    setWeek({
      startDate,
      endDate: dayjs(startDate).add(6, 'day').toDate(),
    });

    setSelectedDate(startDate);
  };

  const handleNextWeek = () => {
    const startDate = dayjs(week.endDate).add(1, 'day').toDate();

    setWeek({
      startDate,
      endDate: dayjs(startDate).add(6, 'day').toDate(),
    });

    setSelectedDate(startDate);
  };

  return (
    <View className="flex size-full flex-col items-center bg-white px-4 py-2 dark:bg-black">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center justify-between gap-4">
          <View className="">
            <View className="flex flex-row items-center justify-center gap-1">
              <TouchableOpacity
                className="h-12 w-16 flex-none items-center justify-center rounded-xl bg-gray-50"
                onPress={handlePrevWeek}
              >
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
              <View className="">
                <Text className="text-3xl font-bold dark:text-white">
                  {dayjs(week.startDate).format('YYYY년 MM월')}
                </Text>
              </View>
              <TouchableOpacity
                className="h-12 w-16 flex-none items-center justify-center rounded-xl bg-gray-50"
                onPress={handleNextWeek}
              >
                <Ionicons name="chevron-forward" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <TouchableOpacity
              className="h-12 w-20 flex-none items-center justify-center rounded-xl bg-gray-50"
              onPress={handleSelectToday}
            >
              <Text className="font-bold text-gray-700">오늘</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* weeks */}
      <View className="mt-5 h-32 w-full border-b-2 border-gray-100 pb-5">
        <View key={`schedule-week-${uuid.v4()}`} className="flex w-full flex-row items-center justify-center gap-3">
          {new Array(7).fill('*').map((_, index) => (
            <View key={`schedule-item-${uuid.v4()}`} className="flex w-12 flex-col items-center justify-center gap-2">
              <View className="w-full items-center justify-center">
                <Text
                  className={cx('font-bold', {
                    'text-blue-400': dayjs(week.startDate).add(index, 'day').day() === 6,
                    'text-red-400': dayjs(week.startDate).add(index, 'day').day() === 0,
                    'text-gray-400': ![0, 6].includes(dayjs(week.startDate).add(index, 'day').day()),
                  })}
                >
                  {getDaysOfWeek(dayjs(week.startDate).add(index, 'day').day())}
                </Text>
              </View>

              <WeekDayItem
                date={dayjs(week.startDate).add(index, 'day').toDate()}
                today={isSameDate(selectedDate, dayjs(week.startDate).add(index, 'day').toDate())}
                onPress={(date) => setSelectedDate(date)}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

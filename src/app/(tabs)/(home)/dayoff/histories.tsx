import { useContext, useState } from 'react';

import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Entypo, Feather } from '@expo/vector-icons';

import { useVacations } from '@/domain/documents/queries/vacations';
import SelectedButton from '@/shared/components/buttons/SelectedButton';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import cx from 'classnames';
import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration).locale(ko);

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

const VacationItem = ({
  vacation,
  mode = 'light',
}: Readonly<{ vacation: DocumentVacation; mode?: 'light' | 'dark' }>) => {
  return (
    <View className="relative mt-4 px-3">
      <View
        className="flex w-full flex-row gap-3 rounded-2xl bg-gray-50 px-6 py-4 dark:bg-gray-900"
        style={{
          shadowColor: mode === 'light' ? '#000' : '#FFF',
          shadowOpacity: 0.15,
          shadowOffset: { width: 1, height: 2 },
        }}
      >
        <View className="mt-2 w-10 flex-none">
          <Feather name="calendar" size={24} color={mode === 'light' ? 'black' : 'white'} />
        </View>
        <View className="flex-1">
          <View className="flex flex-col items-center gap-2">
            <Text className="w-full text-base font-semibold dark:text-white" numberOfLines={2} lineBreakMode="tail">
              {parseVacationType(vacation.vacationType)}
            </Text>

            <View className="flex w-full flex-row items-center gap-1">
              <Text className="w-16 flex-none text-right text-xs text-gray-500 dark:text-gray-400">휴가일 : </Text>
              <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                <Text className="">{dayjs(vacation.startDate).format('YYYY-MM-DD (dd)')}</Text>
                {dayjs(vacation.startDate).isBefore(vacation.endDate) && (
                  <>
                    <Text className=""> - </Text>
                    <Text className="">{dayjs(vacation.endDate).format('YYYY-MM-DD (dd)')}</Text>
                  </>
                )}
              </Text>
            </View>
            <View className="flex w-full flex-row items-center gap-2">
              <Text className="w-16 flex-none text-xs text-gray-500 dark:text-gray-400">휴가 사용일 : </Text>
              <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                <Text className="">
                  <Text className="">{vacation.usedDays} 일</Text>
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function DayoffHistoriesPage() {
  // context
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // query
  const { vacations } = useVacations({
    userUniqueId: user?.uniqueId,
    startDateFrom: dayjs().startOf('year').toDate(),
    endDateFrom: dayjs().endOf('year').toDate(),
    page: 0,
    size: 1000,
  });

  // state
  const newVacations = vacations.slice().sort((o1, o2) => (dayjs(o1.startDate).isBefore(o2.startDate) ? 1 : -1));
  const [selectedVacationType, setSelectedVacationType] = useState<VacationType | 'ALL'>('ALL');

  return (
    <View className="flex size-full flex-col items-center">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center justify-between gap-4">
          <View className="flex flex-row items-center gap-3">
            {/* backward */}
            <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
              <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
            </TouchableOpacity>

            {/* today */}
            <View className="flex flex-row items-end gap-1">
              <Text className="text-xl font-bold dark:text-white">휴가 내역</Text>
            </View>
          </View>
        </View>
      </View>

      {/* contents */}
      <View className="flex w-full flex-col items-center gap-2">
        <View className="mt-3 w-full">
          <View className="flex flex-row items-center gap-3">
            <Text className="text-lg font-bold text-gray-500">{dayjs().format('YYYY')}</Text>
            <Text className="text-lg font-bold text-gray-500">
              <Text className="">(총 사용 개수: </Text>
              <Text className="">
                {newVacations
                  .filter((vacation) => vacation.vacationType === 'GENERAL')
                  .reduce((current, vacation) => vacation.usedDays + current, 0)}{' '}
                개
              </Text>
              <Text className="">)</Text>
            </Text>
          </View>
        </View>

        <View className="mt-3 w-full">
          <View className="flex flex-row items-center gap-1">
            <SelectedButton
              selected={selectedVacationType === 'ALL'}
              label="전체"
              onSelect={() => setSelectedVacationType('ALL')}
            />
            <SelectedButton
              selected={selectedVacationType === 'GENERAL'}
              label="연차"
              onSelect={() => setSelectedVacationType('GENERAL')}
            />
            <SelectedButton
              selected={selectedVacationType === 'COMPENSATORY'}
              label="보상 휴가"
              onSelect={() => setSelectedVacationType('COMPENSATORY')}
            />
            <SelectedButton
              selected={selectedVacationType === 'OFFICIAL'}
              label="공가"
              onSelect={() => setSelectedVacationType('OFFICIAL')}
            />
          </View>
        </View>

        <SafeAreaView className="size-full">
          <FlashList
            className="w-full"
            data={newVacations.filter((vacation) =>
              selectedVacationType === 'ALL' ? true : vacation.vacationType === selectedVacationType,
            )}
            renderItem={({ item }) => <VacationItem vacation={item} />}
            ListFooterComponent={<View className="h-16 w-full" />}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

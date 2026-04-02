import { useContext, useState } from 'react';

import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import NoDataLottie from '@/assets/lotties/no-data.json';
import { useVacations } from '@/domain/documents/queries/vacations';
import { Icon } from '@/shared/components/Icon';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import { FlashList } from '@shopify/flash-list';
import LottieView from 'lottie-react-native';

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
          <Text className="text-sm font-semibold text-blue-500">{vacation.usedDays}일</Text>
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

  return (
    <View className="flex size-full flex-col">
      {/* header */}
      <View className="relative mb-2 flex flex-row items-center justify-center">
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
      </View>

      {/* year + total */}
      <View className="mt-2 flex flex-row items-center gap-2">
        <Text className="text-base font-bold text-gray-500">{dayjs().format('YYYY')}</Text>
        <Text className="text-sm text-gray-500">
          (총 사용: {newVacations.reduce((current, vacation) => vacation.usedDays + current, 0)}일)
        </Text>
      </View>

      {/* filter chips */}
      <View className="mt-3 flex flex-row items-center gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = selectedVacationType === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              className={`rounded-full px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
              disabled={isActive}
              onPress={() => setSelectedVacationType(option.key)}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* list */}
      <View className="mt-2 flex-1">
        <FlashList
          data={newVacations}
          refreshing={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
          renderItem={({ item }) => <VacationItem vacation={item} />}
          ListFooterComponent={newVacations.length === 0 ? <NoVacation /> : null}
          onRefresh={() => reload()}
        />
      </View>
    </View>
  );
}

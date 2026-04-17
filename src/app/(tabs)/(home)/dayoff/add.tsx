import { useContext, useEffect, useState } from 'react';

import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { useDefaultClassNames } from 'react-native-ui-datepicker';

import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { FontAwesome5 } from '@expo/vector-icons';

import { useRequestDocument } from '@/domain/documents/queries/documents';
import { useCreateVacation } from '@/domain/documents/queries/vacations';
import { useUserLeaveEntry } from '@/domain/users/queries/users';
import { Icon } from '@/shared/components/Icon';
import Loading from '@/shared/components/loading/Loading';
import SelectCompLeaveEntriesModal from '@/shared/components/modals/SelectCompLeaveEntriesModal';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';
import Reanimated from 'react-native-reanimated';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterPage } from '@/shared/components/motion/entering';

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

const VACATION_TYPES: { key: VacationType; label: string }[] = [
  { key: 'GENERAL', label: '연차' },
  { key: 'COMPENSATORY', label: '보상 휴가' },
  { key: 'OFFICIAL', label: '공가' },
];

const VACATION_SUB_TYPES: { key: VacationSubType | 'all'; label: string }[] = [
  { key: 'all', label: '종일' },
  { key: 'AM_HALF_DAY_OFF', label: '오전 반차' },
  { key: 'PM_HALF_DAY_OFF', label: '오후 반차' },
];

export default function AddDayOff() {
  // context
  const { theme } = useContext(ThemeContext);
  const { userDetail } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  // queries
  const { leaveEntry } = useUserLeaveEntry({ uniqueId: userDetail?.id, year: dayjs().year() });
  const { requestDocument } = useRequestDocument();
  const { createVacation, isLoading } = useCreateVacation({
    onSuccess: (data) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      requestDocument(data.id);

      router.push('/(tabs)/(home)');

      showToast({
        title: '휴가 신청 완료',
        description: `${parseVacationType(data.vacationType)}(이)가 신청되었습니다.`,
      });
    },
  });

  // state
  const remainingDays = (leaveEntry?.totalLeaveDays || 0) - (leaveEntry?.usedLeaveDays || 0);
  const remainingCompDays = (leaveEntry?.totalCompLeaveDays || 0) - (leaveEntry?.usedCompLeaveDays || 0);

  const [selectedDate, setSelectedDate] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf('day').toDate(),
    endDate: dayjs().startOf('day').toDate(),
  });
  const [vacationType, setVacationType] = useState<VacationType>('GENERAL');
  const [vacationSubType, setVacationSubType] = useState<VacationSubType | 'all'>('all');
  const [reason, setReason] = useState<string>('개인 사유');

  const [showCompLeaveEntries, setShowCompLeaveEntries] = useState<boolean>(false);
  const [selectedCompLeaveEntries, setSelectedCompLeaveEntries] = useState<UserCompLeaveEntry[]>();

  // hooks
  const router = useRouter();
  const defaultClassNames = useDefaultClassNames();

  // useEffect
  useEffect(() => {
    if (showCompLeaveEntries) {
      return;
    }

    if (!selectedCompLeaveEntries || selectedCompLeaveEntries.length === 0) {
      setVacationType('GENERAL');
    }
  }, [showCompLeaveEntries, selectedCompLeaveEntries]);

  // handle
  const handleCreateVacation = () => {
    if (dayjs(selectedDate.startDate).isAfter(selectedDate.endDate)) {
      showToast({ title: '휴가일이 이상한디?', description: '똑바로 선택해주셈! 알겠셈?' });
      return;
    }

    createVacation({
      userUniqueId: userDetail?.id || '',
      vacationType,
      vacationSubType: vacationSubType === 'all' ? undefined : vacationSubType,
      startDate: dayjs(selectedDate.startDate).format('YYYY-MM-DD'),
      endDate: dayjs(selectedDate.endDate).format('YYYY-MM-DD'),
      reason,
      compLeaveEntries: (selectedCompLeaveEntries || []).map((item) => ({
        compLeaveEntryId: item.id,
        usedDays:
          dayjs.duration(dayjs(selectedDate.endDate).unix() - dayjs(selectedDate.startDate).unix() + 1_000).days() + 1,
      })),
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
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

          <Text className="text-xl font-bold dark:text-white">휴가 신청</Text>

          <TouchableOpacity className="absolute right-0" onPress={handleCreateVacation}>
            <Text className="text-[14px] font-semibold text-blue-500">신청</Text>
          </TouchableOpacity>
        </View>

        {/* scrollable content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 112 }}
          showsVerticalScrollIndicator={false}
        >
          {/* leave info card (merged) */}
          <Reanimated.View entering={enterPage(0)}>
          <Text className="mb-3 mt-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            잔여 현황
          </Text>
          <View className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900" style={CARD_SHADOW}>
            {/* 연차 row */}
            <View className="flex flex-row items-center gap-3 px-4 py-3.5">
              <View
                className="size-9 flex-none items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
              >
                <Icon sf="leaf" fallback="🌿" size={18} color="#22c55e" />
              </View>
              <Text className="flex-1 text-[15px] font-semibold dark:text-white">연차</Text>
              <View className="flex flex-row items-center gap-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  전체 {leaveEntry?.totalLeaveDays} · 사용 {leaveEntry?.usedLeaveDays} · 남은{' '}
                </Text>
                <Text
                  className={cx('text-xs font-bold', {
                    'text-black dark:text-white': remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.5,
                    'text-amber-600 dark:text-amber-400':
                      remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.3 &&
                      remainingDays <= (leaveEntry?.totalLeaveDays || 0) * 0.5,
                    'text-red-600 dark:text-red-400': remainingDays <= (leaveEntry?.totalLeaveDays || 0) * 0.3,
                  })}
                >
                  {remainingDays}
                </Text>
              </View>
            </View>

            {/* divider */}
            <View className="ml-[48px] border-b border-gray-100 dark:border-gray-800" />

            {/* 보상 휴가 row */}
            <View className="flex flex-row items-center gap-3 px-4 py-3.5">
              <View
                className="size-9 flex-none items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}
              >
                <Icon sf="gift" fallback="🎁" size={18} color="#f59e0b" />
              </View>
              <Text className="flex-1 text-[15px] font-semibold dark:text-white">보상 휴가</Text>
              <View className="flex flex-row items-center gap-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  전체 {leaveEntry?.totalCompLeaveDays} · 사용 {leaveEntry?.usedCompLeaveDays} · 남은{' '}
                </Text>
                <Text
                  className={cx('text-xs font-bold', {
                    'text-black dark:text-white': remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                    'text-amber-600 dark:text-amber-400':
                      remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.3 &&
                      remainingCompDays <= (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                    'text-red-600 dark:text-red-400': remainingCompDays <= (leaveEntry?.totalCompLeaveDays || 0) * 0.3,
                  })}
                >
                  {remainingCompDays}
                </Text>
              </View>
            </View>
          </View>
          </Reanimated.View>

          {/* vacation type chips */}
          <Reanimated.View entering={enterPage(80)} className="mt-8">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              휴가 구분
            </Text>
            <View className="flex flex-row items-center gap-2">
              {VACATION_TYPES.map((option) => {
                const isActive = vacationType === option.key;
                return (
                  <AnimatedPressable
                    key={option.key}
                    className={`rounded-full px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                    disabled={isActive}
                    onPress={() => {
                      setVacationType(option.key);
                      if (option.key === 'COMPENSATORY') {
                        setShowCompLeaveEntries(true);
                      }
                    }}
                  >
                    <Text
                      className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      {option.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </Reanimated.View>

          {/* vacation sub type chips */}
          <Reanimated.View entering={enterPage(140)} className="mt-6">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              부가 구분
            </Text>
            <View className="flex flex-row items-center gap-2">
              {VACATION_SUB_TYPES.map((option) => {
                const isActive = vacationSubType === option.key;
                return (
                  <AnimatedPressable
                    key={option.key}
                    className={`rounded-full px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                    disabled={isActive}
                    onPress={() => setVacationSubType(option.key)}
                  >
                    <Text
                      className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      {option.label}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          </Reanimated.View>

          {/* reason input */}
          <Reanimated.View entering={enterPage(200)} className="mt-6">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              사유
            </Text>
            <View className="rounded-2xl bg-white px-4 py-3 dark:bg-gray-900" style={CARD_SHADOW}>
              <TextInput
                className={cx('w-full text-[15px] dark:text-white', {
                  'h-12': Device.osName !== 'iOS',
                  'h-8': Device.osName === 'iOS',
                })}
                numberOfLines={1}
                placeholder="개인 사유"
                placeholderTextColor={theme === 'light' ? '#9ca3af' : '#6b7280'}
                value={reason}
                onChangeText={(value) => setReason(value)}
              />
            </View>
          </Reanimated.View>

          {/* calendar */}
          <Reanimated.View entering={enterPage(260)} className="mt-6">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              기간
            </Text>
            <View className="rounded-2xl bg-white p-3 dark:bg-gray-900" style={CARD_SHADOW}>
            <DateTimePicker
              classNames={{
                ...defaultClassNames,
                today: 'bg-gray-200 dark:bg-gray-700 mx-[2px] rounded-full ',
                today_label: 'text-black dark:text-white',
                selected: 'bg-blue-500 mx-[2px] rounded-full',
                selected_label: 'text-white',
                range_fill: 'bg-gray-200 dark:bg-gray-700',
                range_start: 'bg-blue-500 mx-[2px] rounded-full',
                range_start_label: 'text-white',
                range_end: 'bg-blue-500 mx-[2px] rounded-full',
                range_end_label: 'text-white',
                outside_label: 'text-gray-300 dark:text-gray-600',
                weekday_label: 'text-black dark:text-white',
                day_label: 'text-black dark:text-white',
                year_selector_label: 'text-black dark:text-white font-bold',
                month_selector_label: 'text-black dark:text-white font-bold text-lg',
                button_next:
                  'size-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-center',
                button_prev:
                  'size-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-row items-center justify-center',
              }}
              mode="range"
              locale="ko"
              showOutsideDays
              disableYearPicker
              disableMonthPicker
              components={{
                IconNext: <FontAwesome5 name="angle-right" size={24} color={theme === 'light' ? 'black' : 'white'} />,
                IconPrev: <FontAwesome5 name="angle-left" size={24} color={theme === 'light' ? 'black' : 'white'} />,
              }}
              startDate={selectedDate.startDate}
              endDate={selectedDate.endDate}
              onChange={({ startDate, endDate }) =>
                setSelectedDate({
                  startDate: dayjs(startDate as string).toDate(),
                  endDate: dayjs(endDate as string).toDate(),
                })
              }
            />
            </View>
          </Reanimated.View>
        </ScrollView>
      </View>
      <SelectCompLeaveEntriesModal
        show={showCompLeaveEntries}
        onClose={() => setShowCompLeaveEntries(false)}
        onSelect={(entries) => setSelectedCompLeaveEntries(entries)}
      />
    </>
  );
}

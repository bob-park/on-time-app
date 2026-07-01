import { useContext, useEffect, useState } from 'react';

import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import DateTimePicker, { useDefaultClassNames } from 'react-native-ui-datepicker';

import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';

import { useRequestDocument } from '@/domain/documents/queries/documents';
import { useCreateVacation } from '@/domain/documents/queries/vacations';
import { useUserLeaveEntry } from '@/domain/users/queries/users';
import Loading from '@/shared/components/loading/Loading';
import SelectCompLeaveEntriesModal from '@/shared/components/modals/SelectCompLeaveEntriesModal';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterPage } from '@/shared/components/motion/entering';
import { Button } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

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
  const { userinfo: userDetail } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  // queries
  const { leaveEntry } = useUserLeaveEntry({ uniqueId: userDetail?.sub, year: dayjs().year() });
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
      userUniqueId: userDetail?.sub || '',
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

  // mode-safe raw colors
  const contentColor = theme === 'light' ? '#15171c' : '#ffffff';
  const brandColor = '#1ed760';
  const placeholderColor = theme === 'light' ? '#8a8f99' : 'rgba(255,255,255,0.5)';

  return (
    <>
      <View className="flex size-full flex-col bg-base dark:bg-base-dark">
        {/* header */}
        <View className="relative mb-2 flex flex-row items-center justify-center">
          <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={contentColor} />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-content dark:text-content-dark">휴가 신청</Text>
        </View>

        {/* scrollable content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* leave info card (merged) */}
          <Reanimated.View entering={enterPage(0)}>
            <Text className="mt-4 mb-3 text-xs font-bold tracking-wider text-muted uppercase dark:text-muted-dark">
              잔여 현황
            </Text>
            <View className="overflow-hidden rounded-3xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
              {/* 연차 row */}
              <View className="flex flex-row items-center gap-3 px-4 py-3.5">
                <View className="size-9 flex-none items-center justify-center rounded-xl bg-elevated dark:bg-elevated-dark">
                  <Ionicons name="leaf" size={18} color={brandColor} />
                </View>
                <Text className="flex-1 text-[15px] font-semibold text-content dark:text-content-dark">연차</Text>
                <View className="flex flex-row items-center gap-1">
                  <Text className="text-xs text-muted dark:text-muted-dark" style={TABULAR}>
                    전체 {leaveEntry?.totalLeaveDays} · 사용 {leaveEntry?.usedLeaveDays} · 남은{' '}
                  </Text>
                  <Text
                    className={cx('text-xs font-bold', {
                      'text-content dark:text-content-dark': remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.5,
                      'text-amber-600 dark:text-amber-400':
                        remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.3 &&
                        remainingDays <= (leaveEntry?.totalLeaveDays || 0) * 0.5,
                      'text-danger dark:text-danger-dark': remainingDays <= (leaveEntry?.totalLeaveDays || 0) * 0.3,
                    })}
                    style={TABULAR}
                  >
                    {remainingDays}
                  </Text>
                </View>
              </View>

              {/* divider */}
              <View className="ml-[48px] border-b border-border dark:border-border-dark" />

              {/* 보상 휴가 row */}
              <View className="flex flex-row items-center gap-3 px-4 py-3.5">
                <View className="size-9 flex-none items-center justify-center rounded-xl bg-elevated dark:bg-elevated-dark">
                  <Ionicons name="gift" size={18} color={brandColor} />
                </View>
                <Text className="flex-1 text-[15px] font-semibold text-content dark:text-content-dark">보상 휴가</Text>
                <View className="flex flex-row items-center gap-1">
                  <Text className="text-xs text-muted dark:text-muted-dark" style={TABULAR}>
                    전체 {leaveEntry?.totalCompLeaveDays} · 사용 {leaveEntry?.usedCompLeaveDays} · 남은{' '}
                  </Text>
                  <Text
                    className={cx('text-xs font-bold', {
                      'text-content dark:text-content-dark':
                        remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                      'text-amber-600 dark:text-amber-400':
                        remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.3 &&
                        remainingCompDays <= (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                      'text-danger dark:text-danger-dark':
                        remainingCompDays <= (leaveEntry?.totalCompLeaveDays || 0) * 0.3,
                    })}
                    style={TABULAR}
                  >
                    {remainingCompDays}
                  </Text>
                </View>
              </View>
            </View>
          </Reanimated.View>

          {/* vacation type chips */}
          <Reanimated.View entering={enterPage(80)} className="mt-8">
            <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase dark:text-muted-dark">
              휴가 구분
            </Text>
            <View className="flex flex-row items-center gap-2">
              {VACATION_TYPES.map((option) => {
                const isActive = vacationType === option.key;
                return (
                  <AnimatedPressable
                    key={option.key}
                    className={cx(
                      'rounded-full px-4 py-2',
                      isActive ? 'bg-brand' : 'bg-elevated dark:bg-elevated-dark',
                    )}
                    disabled={isActive}
                    onPress={() => {
                      setVacationType(option.key);
                      if (option.key === 'COMPENSATORY') {
                        setShowCompLeaveEntries(true);
                      }
                    }}
                  >
                    <Text
                      className={cx(
                        'text-sm font-semibold',
                        isActive ? 'text-black' : 'text-content dark:text-content-dark',
                      )}
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
            <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase dark:text-muted-dark">
              부가 구분
            </Text>
            <View className="flex flex-row items-center gap-2">
              {VACATION_SUB_TYPES.map((option) => {
                const isActive = vacationSubType === option.key;
                return (
                  <AnimatedPressable
                    key={option.key}
                    className={cx(
                      'rounded-full px-4 py-2',
                      isActive ? 'bg-brand' : 'bg-elevated dark:bg-elevated-dark',
                    )}
                    disabled={isActive}
                    onPress={() => setVacationSubType(option.key)}
                  >
                    <Text
                      className={cx(
                        'text-sm font-semibold',
                        isActive ? 'text-black' : 'text-content dark:text-content-dark',
                      )}
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
            <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase dark:text-muted-dark">
              사유
            </Text>
            <View className="rounded-3xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
              <TextInput
                className={cx('w-full text-[15px] text-content dark:text-content-dark', {
                  'h-12': Device.osName !== 'iOS',
                  'h-8': Device.osName === 'iOS',
                })}
                numberOfLines={1}
                placeholder="개인 사유"
                placeholderTextColor={placeholderColor}
                value={reason}
                onChangeText={(value) => setReason(value)}
              />
            </View>
          </Reanimated.View>

          {/* calendar */}
          <Reanimated.View entering={enterPage(260)} className="mt-6">
            <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase dark:text-muted-dark">
              기간
            </Text>
            <View className="rounded-3xl border border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark">
              <DateTimePicker
                classNames={{
                  ...defaultClassNames,
                  today: 'bg-elevated dark:bg-elevated-dark mx-[2px] rounded-full ',
                  today_label: 'text-content dark:text-content-dark',
                  selected: 'bg-brand mx-[2px] rounded-full',
                  selected_label: 'text-black',
                  range_fill: 'bg-elevated dark:bg-elevated-dark',
                  range_start: 'bg-brand mx-[2px] rounded-full',
                  range_start_label: 'text-black',
                  range_end: 'bg-brand mx-[2px] rounded-full',
                  range_end_label: 'text-black',
                  outside_label: 'text-muted dark:text-muted-dark',
                  weekday_label: 'text-content dark:text-content-dark',
                  day_label: 'text-content dark:text-content-dark',
                  year_selector_label: 'text-content dark:text-content-dark font-bold',
                  month_selector_label: 'text-content dark:text-content-dark font-bold text-lg',
                  button_next:
                    'size-10 rounded-lg bg-elevated dark:bg-elevated-dark flex flex-row items-center justify-center',
                  button_prev:
                    'size-10 rounded-lg bg-elevated dark:bg-elevated-dark flex flex-row items-center justify-center',
                }}
                mode="range"
                locale="ko"
                showOutsideDays
                disableYearPicker
                disableMonthPicker
                components={{
                  IconNext: <FontAwesome5 name="angle-right" size={24} color={contentColor} />,
                  IconPrev: <FontAwesome5 name="angle-left" size={24} color={contentColor} />,
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

          {/* submit */}
          <Reanimated.View entering={enterPage(320)} className="mt-8">
            <Button variant="primary" label="신청하기" onPress={handleCreateVacation} />
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

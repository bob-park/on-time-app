import { useContext, useEffect, useState } from 'react';

import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import DateTimePicker, { useDefaultClassNames } from 'react-native-ui-datepicker';

import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useRequestDocument } from '@/domain/documents/queries/documents';
import { useCreateVacation } from '@/domain/documents/queries/vacations';
import { countRequestedDays } from '@/domain/documents/vacationDays';
import { useUserLeaveEntry } from '@/domain/users/queries/users';
import { Icon } from '@/shared/components/Icon';
import Loading from '@/shared/components/loading/Loading';
import SelectCompLeaveEntriesModal from '@/shared/components/modals/SelectCompLeaveEntriesModal';
import { enterPage } from '@/shared/components/motion/entering';
import { Button, Card, ChoiceChip, Segmented, usePalette } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';

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

const VACATION_SUB_TYPES: { key: VacationSubType | 'all'; label: string }[] = [
  { key: 'all', label: '종일' },
  { key: 'AM_HALF_DAY_OFF', label: '오전 반차' },
  { key: 'PM_HALF_DAY_OFF', label: '오후 반차' },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-muted dark:text-muted-dark mt-6 mb-2 text-[11px] font-semibold tracking-wider">
      {children}
    </Text>
  );
}

export default function AddDayOff() {
  // context
  const { userinfo: userDetail } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  // hooks
  const router = useRouter();
  const palette = usePalette();
  const defaultClassNames = useDefaultClassNames();
  const { type } = useLocalSearchParams<{ type?: VacationType }>();

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

  // useEffect
  useEffect(() => {
    if (showCompLeaveEntries) {
      return;
    }

    if (!selectedCompLeaveEntries || selectedCompLeaveEntries.length === 0) {
      setVacationType('GENERAL');
    }
  }, [showCompLeaveEntries, selectedCompLeaveEntries]);

  // 홈의 '보상휴가' 바로가기로 진입하면 보상휴가 선택 모달을 바로 연다.
  useEffect(() => {
    if (type === 'COMPENSATORY') {
      setVacationType('COMPENSATORY');
      setShowCompLeaveEntries(true);
    }
  }, [type]);

  // handle
  const handleChangeType = (value: VacationType) => {
    setVacationType(value);
    if (value === 'COMPENSATORY') {
      setShowCompLeaveEntries(true);
    }
  };

  const handleCreateVacation = () => {
    if (dayjs(selectedDate.startDate).isAfter(selectedDate.endDate)) {
      showToast({ title: '종료일이 시작일보다 빨라요', description: '휴가 날짜를 선택해 주세요' });
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

  const typeOptions: { value: VacationType; label: string }[] = [
    { value: 'GENERAL', label: `연차 · ${remainingDays}일` },
    { value: 'COMPENSATORY', label: `보상휴가 · ${remainingCompDays}일` },
    { value: 'OFFICIAL', label: '공가' },
  ];

  const requestedDays = countRequestedDays({
    startDate: selectedDate.startDate,
    endDate: selectedDate.endDate,
    subType: vacationSubType === 'all' ? undefined : vacationSubType,
  });
  const afterDays = remainingDays - requestedDays;

  const start = dayjs(selectedDate.startDate);
  const end = dayjs(selectedDate.endDate);
  const rangeLabel = start.isSame(end, 'day')
    ? start.format('M월 D일 (dd)')
    : `${start.format('M월 D일 (dd)')} – ${end.format('M월 D일 (dd)')}`;

  return (
    <>
      <View className="bg-base dark:bg-base-dark flex size-full flex-col">
        {/* header */}
        <View className="relative mb-2 flex flex-row items-center justify-center">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            className="absolute left-0 size-11 items-start justify-center"
            onPress={() => router.back()}
          >
            <Icon sf="chevron.left" fallback="‹" size={22} weight="semibold" color={palette.content} />
          </TouchableOpacity>
          <Text className="text-content dark:text-content-dark text-xl font-bold">휴가 신청</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* type */}
          <Reanimated.View entering={enterPage(0)} className="mt-4">
            <Segmented options={typeOptions} value={vacationType} onChange={handleChangeType} />
          </Reanimated.View>

          {/* sub type */}
          <Reanimated.View entering={enterPage(60)}>
            <SectionLabel>사용 단위</SectionLabel>
            <View className="flex-row gap-2">
              {VACATION_SUB_TYPES.map((option) => (
                <ChoiceChip
                  key={option.key}
                  label={option.label}
                  selected={vacationSubType === option.key}
                  onPress={() => setVacationSubType(option.key)}
                />
              ))}
            </View>
          </Reanimated.View>

          {/* period */}
          <Reanimated.View entering={enterPage(120)}>
            <SectionLabel>기간</SectionLabel>
            <Card className="p-3">
              <Text className="text-content dark:text-content-dark px-1 pb-2 text-[15px] font-bold" style={TABULAR}>
                {rangeLabel}
              </Text>
              <DateTimePicker
                classNames={{
                  ...defaultClassNames,
                  today: 'border border-brand dark:border-brand-dark mx-[2px] rounded-full',
                  today_label: 'text-content dark:text-content-dark',
                  selected: 'bg-brand mx-[2px] rounded-full',
                  selected_label: 'text-white',
                  range_fill: 'bg-brand-subtle',
                  range_start: 'bg-brand mx-[2px] rounded-full',
                  range_start_label: 'text-white',
                  range_end: 'bg-brand mx-[2px] rounded-full',
                  range_end_label: 'text-white',
                  outside_label: 'text-muted dark:text-muted-dark',
                  weekday_label: 'text-muted dark:text-muted-dark',
                  day_label: 'text-content dark:text-content-dark',
                  year_selector_label: 'text-content dark:text-content-dark font-bold',
                  month_selector_label: 'text-content dark:text-content-dark font-bold text-base',
                  button_next: 'size-9 rounded-lg bg-elevated dark:bg-elevated-dark items-center justify-center',
                  button_prev: 'size-9 rounded-lg bg-elevated dark:bg-elevated-dark items-center justify-center',
                }}
                mode="range"
                locale="ko"
                showOutsideDays
                disableYearPicker
                disableMonthPicker
                components={{
                  IconNext: (
                    <Icon sf="chevron.right" fallback="›" size={14} weight="semibold" color={palette.content} />
                  ),
                  IconPrev: <Icon sf="chevron.left" fallback="‹" size={14} weight="semibold" color={palette.content} />,
                }}
                startDate={selectedDate.startDate}
                endDate={selectedDate.endDate}
                onChange={({ startDate, endDate }) =>
                  setSelectedDate({
                    startDate: dayjs(startDate as string).toDate(),
                    // 시작일만 고른 상태에서는 종료일 = 시작일 (dayjs(undefined) 는 '지금'이 되므로 방지)
                    endDate: dayjs((endDate ?? startDate) as string).toDate(),
                  })
                }
              />
            </Card>
          </Reanimated.View>

          {/* reason */}
          <Reanimated.View entering={enterPage(180)}>
            <SectionLabel>사유</SectionLabel>
            <Card className="px-4">
              <TextInput
                className="text-content dark:text-content-dark min-h-12 w-full text-[15px]"
                numberOfLines={1}
                placeholder="개인 사유"
                placeholderTextColor={palette.muted}
                value={reason}
                onChangeText={(value) => setReason(value)}
              />
            </Card>
          </Reanimated.View>

          {/* preview — 연차만 잔여일이 차감된다 */}
          {vacationType === 'GENERAL' && (
            <View className="bg-brand-subtle mt-4 rounded-2xl p-3.5">
              <Text className="text-content dark:text-content-dark text-[13px]" style={TABULAR}>
                {requestedDays}일 사용 → 신청 후 잔여{' '}
                <Text
                  className={`font-bold ${afterDays < 0 ? 'text-danger dark:text-danger-dark' : 'text-brand dark:text-brand-dark'}`}
                >
                  {afterDays}일
                </Text>
              </Text>
              {afterDays < 0 && (
                <Text className="text-danger dark:text-danger-dark mt-1 text-xs">잔여 연차가 부족해요</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* 하단 고정 CTA */}
        <View className="pt-3 pb-28">
          <Button label="신청하기" onPress={handleCreateVacation} />
        </View>
      </View>
      <SelectCompLeaveEntriesModal
        show={showCompLeaveEntries}
        onClose={() => setShowCompLeaveEntries(false)}
        onSelect={(entries) => setSelectedCompLeaveEntries(entries)}
      />
    </>
  );
}

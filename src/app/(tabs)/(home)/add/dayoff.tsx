import { useContext, useEffect, useState } from 'react';

import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';

import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { Entypo } from '@expo/vector-icons';

import { useRequestDocument } from '@/domain/documents/queries/documents';
import { useCreateVacation } from '@/domain/documents/queries/vacations';
import { useUserLeaveEntry } from '@/domain/users/queries/users';
import Loading from '@/shared/components/loading/Loading';
import SelectCompLeaveEntriesModal from '@/shared/components/modals/SelectCompLeaveEntriesModal';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { showToast } from '@/utils/toast';

import cx from 'classnames';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

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

export default function AddDayOff() {
  // context
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  // queries
  const { leaveEntry } = useUserLeaveEntry({ uniqueId: user?.uniqueId, year: dayjs().year() });
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
  const defaultStyles = useDefaultStyles(theme);

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
    createVacation({
      userUniqueId: user?.uniqueId || '',
      vacationType,
      vacationSubType: vacationSubType === 'all' ? undefined : vacationSubType,
      startDate: dayjs(selectedDate.startDate).format('YYYY-MM-DD'),
      endDate: dayjs(selectedDate.endDate).format('YYYY-MM-DD'),
      reason,
      compLeaveEntries: (selectedCompLeaveEntries || []).map((item) => ({
        compLeaveEntryId: item.id,
        usedDays: dayjs.duration(dayjs(selectedDate.endDate).unix() - dayjs(selectedDate.startDate).unix()).days() + 1,
      })),
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <View className="flex size-full flex-col items-center px-4 py-2">
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
                <Text className="text-xl font-bold dark:text-white">휴가 신청</Text>
              </View>
            </View>

            <View className="">
              <TouchableOpacity
                className="h-10 w-24 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
                onPress={handleCreateVacation}
              >
                <Text className="font-bold text-gray-700 dark:text-gray-100">신청</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* contents */}
        <View className="mt-2 w-full">
          <View className="flex flex-col items-center justify-center gap-2">
            {/* 연차 */}
            <View className="flex w-full flex-row items-center justify-between gap-6 rounded-xl bg-gray-50 px-4 py-4 dark:bg-gray-800">
              <View className="mx-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">전체 휴가</Text>
                <Text className="text-lg font-extrabold dark:text-white">{leaveEntry?.totalLeaveDays}</Text>
              </View>
              <View className="mx-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">사용 개수</Text>
                <Text className="text-lg font-extrabold dark:text-white">{leaveEntry?.usedLeaveDays}</Text>
              </View>
              <View className="mx-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">남은 개수</Text>
                <Text
                  className={cx('text-lg font-extrabold', {
                    'text-black dark:text-white': remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.5,
                    'text-amber-600 dark:text-amber-400':
                      remainingDays > (leaveEntry?.totalLeaveDays || 0) * 0.3 &&
                      remainingDays < (leaveEntry?.totalLeaveDays || 0) * 0.5,
                    'text-red-600 dark:text-red-400': remainingDays < (leaveEntry?.totalLeaveDays || 0) * 0.3,
                  })}
                >
                  {remainingDays}
                </Text>
              </View>
            </View>

            {/* 보상 휴가 */}
            <View className="flex w-full flex-row items-center justify-between gap-6 rounded-xl bg-gray-50 px-4 py-4 dark:bg-gray-800">
              <View className="mx-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">보상 휴가</Text>
                <Text className="text-lg font-extrabold dark:text-white">{leaveEntry?.totalCompLeaveDays}</Text>
              </View>
              <View className="mx-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">사용 개수</Text>
                <Text className="text-lg font-extrabold dark:text-white">{leaveEntry?.usedCompLeaveDays}</Text>
              </View>
              <View className="mx-4">
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">남은 개수</Text>
                <Text
                  className={cx('text-lg font-extrabold', {
                    'text-black dark:text-white': remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                    'text-amber-600 dark:text-amber-400':
                      remainingCompDays > (leaveEntry?.totalCompLeaveDays || 0) * 0.3 &&
                      remainingCompDays < (leaveEntry?.totalCompLeaveDays || 0) * 0.5,
                    'text-red-600 dark:text-red-400': remainingCompDays < (leaveEntry?.totalCompLeaveDays || 0) * 0.3,
                  })}
                >
                  {remainingCompDays}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* selected date picker */}
        <View className="mt-2 size-full">
          <ScrollView className="h-full">
            {/* form */}
            <View className="mt-4 w-full">
              <View className="flex flex-col items-center gap-3">
                {/* vacation type */}
                <View className="w-full">
                  <View className="mb-2">
                    <Text className="text-base font-bold text-gray-400 dark:text-gray-300">휴가 구분</Text>
                  </View>

                  <View className="flex w-full flex-row items-center gap-3">
                    <TouchableOpacity
                      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
                        'bg-gray-100 dark:bg-gray-800': vacationType !== 'GENERAL',
                        'bg-gray-700 dark:bg-gray-100': vacationType === 'GENERAL',
                      })}
                      disabled={vacationType === 'GENERAL'}
                      onPress={() => setVacationType('GENERAL')}
                    >
                      <Text
                        className={cx('font-semibold', {
                          'text-gray-700 dark:text-gray-100': vacationType !== 'GENERAL',
                          'text-gray-100 dark:text-gray-800': vacationType === 'GENERAL',
                        })}
                      >
                        연차
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
                        'bg-gray-100 dark:bg-gray-800': vacationType !== 'COMPENSATORY',
                        'bg-gray-700 dark:bg-gray-100': vacationType === 'COMPENSATORY',
                      })}
                      disabled={vacationType === 'COMPENSATORY'}
                      onPress={() => {
                        setVacationType('COMPENSATORY');
                        setShowCompLeaveEntries(true);
                      }}
                    >
                      <Text
                        className={cx('font-semibold', {
                          'text-gray-700 dark:text-gray-100': vacationType !== 'COMPENSATORY',
                          'text-gray-100 dark:text-gray-800': vacationType === 'COMPENSATORY',
                        })}
                      >
                        보상 휴가
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
                        'bg-gray-100 dark:bg-gray-800': vacationType !== 'OFFICIAL',
                        'bg-gray-700 dark:bg-gray-100': vacationType === 'OFFICIAL',
                      })}
                      disabled={vacationType === 'OFFICIAL'}
                      onPress={() => setVacationType('OFFICIAL')}
                    >
                      <Text
                        className={cx('font-semibold', {
                          'text-gray-700 dark:text-gray-100': vacationType !== 'OFFICIAL',
                          'text-gray-100 dark:text-gray-800': vacationType === 'OFFICIAL',
                        })}
                      >
                        공가
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* vacation sub type */}
                <View className="mt-4 w-full">
                  <View className="mb-2">
                    <Text className="text-base font-bold text-gray-400 dark:text-gray-300">부가 구분</Text>
                  </View>

                  <View className="flex w-full flex-row items-center gap-3">
                    <TouchableOpacity
                      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
                        'bg-gray-100 dark:bg-gray-800': vacationSubType !== 'all',
                        'bg-gray-700 dark:bg-gray-100': vacationSubType === 'all',
                      })}
                      disabled={vacationSubType === 'all'}
                      onPress={() => setVacationSubType('all')}
                    >
                      <Text
                        className={cx('font-semibold', {
                          'text-gray-700 dark:text-gray-100': vacationSubType !== 'all',
                          'text-gray-100 dark:text-gray-800': vacationSubType === 'all',
                        })}
                      >
                        종일
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
                        'bg-gray-100 dark:bg-gray-800': vacationSubType !== 'AM_HALF_DAY_OFF',
                        'bg-gray-700 dark:bg-gray-100': vacationSubType === 'AM_HALF_DAY_OFF',
                      })}
                      disabled={vacationSubType === 'AM_HALF_DAY_OFF'}
                      onPress={() => setVacationSubType('AM_HALF_DAY_OFF')}
                    >
                      <Text
                        className={cx('font-semibold', {
                          'text-gray-700 dark:text-gray-100': vacationSubType !== 'AM_HALF_DAY_OFF',
                          'text-gray-100 dark:text-gray-800': vacationSubType === 'AM_HALF_DAY_OFF',
                        })}
                      >
                        오전 반차
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
                        'bg-gray-100 dark:bg-gray-800': vacationSubType !== 'PM_HALF_DAY_OFF',
                        'bg-gray-700 dark:bg-gray-100': vacationSubType === 'PM_HALF_DAY_OFF',
                      })}
                      disabled={vacationSubType === 'PM_HALF_DAY_OFF'}
                      onPress={() => setVacationSubType('PM_HALF_DAY_OFF')}
                    >
                      <Text
                        className={cx('font-semibold', {
                          'text-gray-700 dark:text-gray-100': vacationSubType !== 'PM_HALF_DAY_OFF',
                          'text-gray-100 dark:text-gray-800': vacationSubType === 'PM_HALF_DAY_OFF',
                        })}
                      >
                        오후 반차
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* vacation sub type */}
            <View className="mt-4 w-full">
              <View className="mb-2">
                <Text className="text-base font-bold text-gray-400 dark:text-gray-300">사유</Text>
              </View>
              <View
                className={cx(
                  'flex w-full flex-row items-center gap-4 rounded-xl border-[1px] border-gray-50 bg-gray-50 px-3 dark:border-gray-900 dark:bg-gray-900',
                )}
              >
                <TextInput
                  className={cx('my-2 items-center text-sm dark:text-white', {
                    'h-12': Device.osName === 'Android',
                    'h-8': Device.osName !== 'Android',
                  })}
                  numberOfLines={1}
                  placeholder="개인 사유"
                  placeholderTextColor="gray"
                  value={reason}
                  onChangeText={(value) => setReason(value)}
                />
              </View>
            </View>

            <View className="mt-4 h-[500px] w-full border-b-[2px] border-gray-100">
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
                  today: {
                    backgroundColor: theme === 'light' ? 'white' : 'black',
                    borderColor: 'blue',
                    borderWidth: 1,
                    borderRadius: '100%',
                  },
                  selected: {
                    backgroundColor: 'blue',
                    borderRadius: '100%',
                  },
                  selected_label: { color: 'white' },
                  range_start_label: {
                    color: 'white',
                  },
                  range_end_label: {
                    color: 'white',
                  },
                }}
              />
            </View>
          </ScrollView>
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

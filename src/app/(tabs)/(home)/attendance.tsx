import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Linking, Modal, Text, TouchableOpacity, View } from 'react-native';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { Entypo, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import SplashLottie from '@/assets/lotties/splash-lottie.json';
import WalkLottie from '@/assets/lotties/walk.json';
import WorkingLottie from '@/assets/lotties/working-logo.json';
import { useAttendanceLocations } from '@/domain/attendances/queries/attendanceGps';
import { useClockIn, useClockOut, useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import Loading from '@/shared/components/loading/Loading';
import dayjs from '@/shared/dayjs';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { isSameMarginOfError } from '@/utils/dataUtils';
import { getDaysOfWeek, round } from '@/utils/parse';

import cx from 'classnames';
import LottieView from 'lottie-react-native';

const WEEKEND_DAYS = [0, 6];

function parseWorkType(workType: AttendanceWorkType) {
  switch (workType) {
    case 'OFFICE':
      return '사무실';
    case 'HOME':
      return '재택근무';
    case 'OUTSIDE':
      return '외근';
    default:
      return '';
  }
}

const InvalidLocationModal = ({
  show,
  address,
  onClose,
}: Readonly<{ show: boolean; address?: string; onClose: () => void }>) => {
  return (
    <Modal visible={show} animationType="fade" transparent onRequestClose={onClose}>
      <BlurView className="relative flex h-screen w-screen flex-col items-center justify-center" tint="dark">
        {/* outside */}
        <TouchableOpacity className="absolute left-0 top-0 h-screen w-screen" activeOpacity={1} onPress={onClose} />

        {/* message */}
        <View
          className="left-auto h-48 w-80 rounded-xl bg-gray-50 dark:bg-gray-700"
          style={{
            shadowColor: 'black',
            shadowOpacity: 0.15,
            shadowOffset: { width: 4, height: 4 },
          }}
        >
          <View className="flex flex-col items-center gap-3 p-4">
            {/* header */}
            <View className="w-full">
              <Text className="text-xl font-extrabold text-gray-500 dark:text-gray-300">잘못된 위치</Text>
            </View>

            {/* message */}
            <View className="mt-4 w-full">
              <Text className="text-center text-lg font-bold text-gray-900 dark:text-gray-200">사무실 아닌디??</Text>
            </View>
          </View>

          {/* action */}
          <View className="absolute bottom-2 right-3">
            <TouchableOpacity className="rounded-xl bg-gray-200 p-4 dark:bg-gray-600" onPress={onClose}>
              <Text className="font-semibold text-gray-500 dark:text-gray-200">닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default function Attendance() {
  // context
  const { theme } = useContext(ThemeContext);
  const { showToast } = useContext(NotificationContext);

  // state
  const [workType, setWorkType] = useState<AttendanceWorkType>('OFFICE');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>();
  const [showInvalidModal, setShowInalidModal] = useState<boolean>(false);
  const [invalidLocation, setInvalidLocation] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string>();

  // queries
  const { locations } = useAttendanceLocations();
  const { today } = useTodayAttendance();
  const { clockIn, isLoading: isClockInLoading } = useClockIn({
    onSuccess: (data) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      showToast({
        title: '출근 완료',
        description: `${dayjs(data.clockInTime).format('HH:mm')} ${parseWorkType(data.workType)}(으)로 출근 처리하였습니다.`,
      });
    },
  });
  const { clockOut, isLoading: isClockOutLoading } = useClockOut({
    onSuccess: (data) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      showToast({
        title: '퇴근 완료',
        description: `${dayjs(data.clockOutTime).format('HH:mm')} ${parseWorkType(data.workType)}(으)로 퇴근 처리하였습니다.`,
      });
    },
  });

  // hooks
  const router = useRouter();

  // useEffect
  useEffect(() => {
    handleGetCurrentLocation();
  }, []);

  useEffect(() => {
    if (!currentLocation || !locations) {
      return;
    }

    for (const location of locations) {
      if (!isDiffLocation(location, currentLocation)) {
        setWorkType('OFFICE');
        return;
      }
    }

    setWorkType('OUTSIDE');
  }, [currentLocation, locations]);

  useEffect(() => {
    if (!currentLocation || !locations) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (workType === 'OFFICE') {
        for (const location of locations) {
          if (isDiffLocation(location, currentLocation)) {
            setInvalidLocation(true);
            return;
          }
        }
      }

      setInvalidLocation(false);
    }, 100);

    return () => {
      timeoutId && clearTimeout(timeoutId);
    };
  }, [workType, currentLocation, locations]);

  useEffect(() => {
    invalidLocation && setShowInalidModal(true);
  }, [invalidLocation]);

  // handle
  const handleGetCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Location permission not granted.', 'Please grant location permissions.', [
        {
          text: 'Open Settings',
          onPress: async () => {
            await Linking.openSettings();
          },
        },
        {
          text: 'Cancel',
        },
      ]);

      try {
        await Location.getBackgroundPermissionsAsync();
      } catch (error) {
        console.error(error);
        return;
      }
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude }).then(
      (addresses) => {
        for (const address of addresses) {
          setCurrentAddress(`${address.region} ${address.district} ${address.street} ${address.streetNumber}`);
        }
      },
    );
    setTimeout(() => {
      setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    }, 1_000);
  };

  const handleClockIn = () => {
    currentLocation && clockIn({ ...currentLocation, workType });
  };

  const handleClockOut = () => {
    today && currentLocation && clockOut({ ...currentLocation, attendanceRecordId: today.id });
  };

  if (!currentLocation) {
    return <Loading />;
  }

  const weekdayColor =
    dayjs().day() === 0 ? 'text-red-500 dark:text-red-300' : dayjs().day() === 6 ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500';

  const isBeforeClockIn = !today?.clockInTime;
  const isAfterClockOut = !!today?.clockOutTime;

  const WORK_TYPES: { key: AttendanceWorkType; label: string; icon: React.ReactNode }[] = [
    {
      key: 'OFFICE',
      label: '사무실',
      icon: (
        <MaterialCommunityIcons
          name="office-building-outline"
          size={18}
          color={workType === 'OFFICE' ? (theme === 'light' ? '#f3f4f6' : '#111827') : theme === 'light' ? '#111827' : '#f3f4f6'}
        />
      ),
    },
    {
      key: 'OUTSIDE',
      label: '외근',
      icon: (
        <FontAwesome
          name="car"
          size={18}
          color={workType === 'OUTSIDE' ? (theme === 'light' ? '#f3f4f6' : '#111827') : theme === 'light' ? '#111827' : '#f3f4f6'}
        />
      ),
    },
    {
      key: 'HOME',
      label: '재택근무',
      icon: (
        <Ionicons
          name="home-sharp"
          size={18}
          color={workType === 'HOME' ? (theme === 'light' ? '#f3f4f6' : '#111827') : theme === 'light' ? '#111827' : '#f3f4f6'}
        />
      ),
    },
  ];

  return (
    <>
      <View className="flex-1">
        {/* header — 다른 서브페이지와 동일 패턴 */}
        <View className="relative mb-2 flex flex-row items-center justify-center">
          <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
          </TouchableOpacity>
          <Text className="text-xl font-bold dark:text-white">
            {isBeforeClockIn ? '출근' : isAfterClockOut ? '근무 완료' : '퇴근'}
          </Text>
        </View>

        {/* today — 숫자가 주인공 */}
        <View className="mt-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            오늘
          </Text>
          <View className="mt-1 flex flex-row items-baseline gap-2">
            <Text
              className="text-[32px] font-bold leading-none text-gray-900 dark:text-white"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {dayjs().format('M월 D일')}
            </Text>
            <Text className={cx('text-lg font-semibold', weekdayColor)}>
              {getDaysOfWeek(dayjs().day())}
            </Text>
          </View>
        </View>

        {/* select work type */}
        <View className="mt-8">
          <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            근무 위치
          </Text>
          <View className="flex flex-row items-center gap-2">
            {WORK_TYPES.map((option) => {
              const isActive = workType === option.key;
              const disabled = today?.status !== 'WAITING';

              return (
                <TouchableOpacity
                  key={option.key}
                  className={cx(
                    'h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl',
                    isActive ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-100 dark:bg-gray-800',
                    disabled && !isActive && 'opacity-50',
                  )}
                  disabled={isActive || disabled}
                  onPress={() => setWorkType(option.key)}
                >
                  {option.icon}
                  <Text
                    className={cx('text-sm font-bold', {
                      'text-white dark:text-gray-900': isActive,
                      'text-gray-700 dark:text-gray-200': !isActive,
                    })}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* animation + time info */}
        <View className="mt-6 flex-1">
          {/* Lottie */}
          <View className="items-center">
            {isBeforeClockIn ? (
              <LottieView style={{ width: 160, height: 160 }} source={SplashLottie} autoPlay loop />
            ) : isAfterClockOut ? (
              <LottieView style={{ width: 160, height: 160 }} source={WalkLottie} autoPlay loop />
            ) : (
              <LottieView style={{ width: 160, height: 160 }} source={WorkingLottie} autoPlay loop />
            )}
          </View>

          {/* time info — 라벨 ↔ 값 정렬, 억지 고정폭 대신 flex */}
          {!isBeforeClockIn && (
            <View className="mt-2 overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
              <TimeInfoRow label="출근 시간" value={dayjs(today?.clockInTime).format('YYYY.M.D · A hh:mm')} />
              <View className="ml-4 border-b border-gray-100 dark:border-gray-800" />
              <TimeInfoRow label="목표 퇴근" value={dayjs(today?.leaveWorkAt).format('YYYY.M.D · A hh:mm')} />
              {isAfterClockOut && (
                <>
                  <View className="ml-4 border-b border-gray-100 dark:border-gray-800" />
                  <TimeInfoRow label="퇴근 시간" value={dayjs(today?.clockOutTime).format('YYYY.M.D · A hh:mm')} />
                </>
              )}
            </View>
          )}
        </View>

        {/* CTA — 썸-존 하단 배치, 전체 폭 */}
        <View className="pb-4 pt-4">
          {isBeforeClockIn ? (
            <TouchableOpacity
              className={cx(
                'h-14 flex-row items-center justify-center gap-2 rounded-2xl',
                isClockInLoading || !currentLocation || invalidLocation ? 'bg-blue-300' : 'bg-blue-500',
              )}
              disabled={isClockInLoading || invalidLocation || !currentLocation}
              onPress={handleClockIn}
            >
              {isClockInLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialCommunityIcons name="video-input-antenna" size={22} color="white" />
              )}
              <Text className="text-base font-bold text-white">출근하기</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={cx(
                'h-14 flex-row items-center justify-center gap-2 rounded-2xl',
                isClockOutLoading || !currentLocation || invalidLocation || isAfterClockOut
                  ? 'bg-gray-500'
                  : 'bg-gray-900 dark:bg-gray-100',
              )}
              disabled={isClockOutLoading || !currentLocation || invalidLocation || isAfterClockOut}
              onPress={handleClockOut}
            >
              {isClockOutLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : isAfterClockOut ? (
                <FontAwesome6 name="dragon" size={22} color={theme === 'light' ? 'white' : '#111827'} />
              ) : (
                <Ionicons name="bus-outline" size={22} color={theme === 'light' ? 'white' : '#111827'} />
              )}
              <Text
                className={cx('text-base font-bold', isAfterClockOut ? 'text-white' : 'text-white dark:text-gray-900')}
              >
                {isAfterClockOut ? '퇴근' : '퇴근하기'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <InvalidLocationModal
        show={showInvalidModal}
        address={currentAddress}
        onClose={() => setShowInalidModal(false)}
      />
    </>
  );
}

function TimeInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</Text>
      <Text
        className="text-sm font-bold text-gray-900 dark:text-white"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}

function isDiffLocation(gps?: AttendanceGps, current?: { latitude: number; longitude: number }): boolean {
  if (!gps || !current) {
    return false;
  }

  const location = {
    latitude: round(gps.latitude, 3),
    longitude: round(gps.longitude, 3),
  };

  const calculateCurrent = {
    latitude: round(current.latitude, 3),
    longitude: round(current.longitude, 3),
  };

  return (
    !isSameMarginOfError(location.latitude, calculateCurrent.latitude, 0.001) ||
    !isSameMarginOfError(location.longitude, calculateCurrent.longitude, 0.001)
  );
}

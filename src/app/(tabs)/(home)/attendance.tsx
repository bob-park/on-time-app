import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Linking, Modal, Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

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
import { enterHero, enterPage } from '@/shared/components/motion/entering';
import { Button, Card, StatusPill } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { isSameMarginOfError } from '@/utils/dataUtils';
import { getDaysOfWeek, round } from '@/utils/parse';

import cx from 'classnames';
import LottieView from 'lottie-react-native';

const WEEKEND_DAYS = [0, 6];
const TABULAR = { fontVariant: ['tabular-nums' as const] };

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
        <TouchableOpacity className="absolute top-0 left-0 h-screen w-screen" activeOpacity={1} onPress={onClose} />

        {/* message */}
        <View
          className="w-80 rounded-3xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark"
          style={{
            shadowColor: '#000000',
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
          }}
        >
          {/* header */}
          <StatusPill label="잘못된 위치" tone="danger" />

          {/* message */}
          <Text className="mt-4 text-lg font-bold text-content dark:text-content-dark">사무실 아닌디??</Text>
          <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
            현재 위치가 등록된 근무지와 달라요. 위치를 다시 확인해 주세요.
          </Text>

          {/* action */}
          <View className="mt-6 self-end">
            <Button variant="secondary" label="닫기" onPress={onClose} />
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

  // icon color tokens (mode-safe)
  const brandColor = '#1ed760';
  const dangerColor = theme === 'light' ? '#e0455a' : '#f3727f';
  const contentColor = theme === 'light' ? '#15171c' : '#ffffff';

  const weekdayColor =
    dayjs().day() === 0
      ? 'text-danger dark:text-danger-dark'
      : dayjs().day() === 6
        ? 'text-blue-500 dark:text-blue-300'
        : 'text-muted dark:text-muted-dark';

  const isBeforeClockIn = !today?.clockInTime;
  const isAfterClockOut = !!today?.clockOutTime;

  const WORK_TYPES: { key: AttendanceWorkType; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    {
      key: 'OFFICE',
      label: '사무실',
      icon: (active) => (
        <MaterialCommunityIcons
          name="office-building-outline"
          size={18}
          color={active ? '#000000' : contentColor}
        />
      ),
    },
    {
      key: 'OUTSIDE',
      label: '외근',
      icon: (active) => <FontAwesome name="car" size={18} color={active ? '#000000' : contentColor} />,
    },
    {
      key: 'HOME',
      label: '재택근무',
      icon: (active) => <Ionicons name="home-sharp" size={18} color={active ? '#000000' : contentColor} />,
    },
  ];

  return (
    <>
      <View className="flex-1 bg-base dark:bg-base-dark">
        {/* header — 다른 서브페이지와 동일 패턴 */}
        <View className="relative mb-2 flex flex-row items-center justify-center">
          <TouchableOpacity className="absolute left-0 items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={contentColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-content dark:text-content-dark">
            {isBeforeClockIn ? '출근' : isAfterClockOut ? '근무 완료' : '퇴근'}
          </Text>
        </View>

        {/* today — 숫자가 주인공 */}
        <Reanimated.View entering={enterHero(40)} className="mt-2">
          <Text className="text-xs font-semibold tracking-wider text-muted uppercase dark:text-muted-dark">오늘</Text>
          <View className="mt-1 flex flex-row items-baseline gap-2">
            <Text className="text-[32px] leading-none font-bold text-content dark:text-content-dark" style={TABULAR}>
              {dayjs().format('M월 D일')}
            </Text>
            <Text className={cx('text-lg font-semibold', weekdayColor)}>{getDaysOfWeek(dayjs().day())}</Text>
          </View>
        </Reanimated.View>

        {/* select work type — pill segment group */}
        <Reanimated.View entering={enterPage(140)} className="mt-8">
          <Text className="mb-3 text-xs font-bold tracking-wider text-muted uppercase dark:text-muted-dark">
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
                    'h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full',
                    isActive ? 'bg-brand' : 'bg-elevated dark:bg-elevated-dark',
                    disabled && !isActive && 'opacity-50',
                  )}
                  disabled={isActive || disabled}
                  onPress={() => setWorkType(option.key)}
                >
                  {option.icon(isActive)}
                  <Text
                    className={cx('text-sm font-bold', {
                      'text-black': isActive,
                      'text-content dark:text-content-dark': !isActive,
                    })}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Reanimated.View>

        {/* GPS / location status */}
        <Reanimated.View entering={enterPage(180)} className="mt-4">
          <Card className={invalidLocation ? 'border-danger dark:border-danger-dark' : 'border-brand'}>
            <View className="flex-row items-center gap-3">
              <View className="size-10 items-center justify-center rounded-full bg-elevated dark:bg-elevated-dark">
                <Ionicons name="location" size={20} color={invalidLocation ? dangerColor : brandColor} />
              </View>
              <View className="flex-1">
                <StatusPill
                  label={invalidLocation ? '위치 확인 필요' : '위치 확인됨'}
                  tone={invalidLocation ? 'danger' : 'brand'}
                />
                <Text
                  className="mt-1.5 text-sm font-semibold text-content dark:text-content-dark"
                  numberOfLines={1}
                >
                  {currentAddress ?? '위치를 확인하는 중...'}
                </Text>
              </View>
            </View>
          </Card>
        </Reanimated.View>

        {/* animation + time info */}
        <Reanimated.View entering={enterPage(220)} className="mt-6 flex-1">
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

          {/* time info — 라벨 ↔ 값 정렬 */}
          {!isBeforeClockIn && (
            <View className="mt-2 overflow-hidden rounded-3xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
              <TimeInfoRow label="출근 시간" value={dayjs(today?.clockInTime).format('YYYY.M.D · A hh:mm')} />
              <View className="ml-4 border-b border-border dark:border-border-dark" />
              <TimeInfoRow label="목표 퇴근" value={dayjs(today?.leaveWorkAt).format('YYYY.M.D · A hh:mm')} />
              {isAfterClockOut && (
                <>
                  <View className="ml-4 border-b border-border dark:border-border-dark" />
                  <TimeInfoRow label="퇴근 시간" value={dayjs(today?.clockOutTime).format('YYYY.M.D · A hh:mm')} />
                </>
              )}
            </View>
          )}
        </Reanimated.View>

        {/* CTA — 썸-존 하단 배치, 전체 폭 */}
        <Reanimated.View entering={enterPage(320)} className="pt-4 pb-28">
          {isBeforeClockIn ? (
            <Button
              variant="primary"
              label="출근하기"
              disabled={isClockInLoading || invalidLocation || !currentLocation}
              onPress={handleClockIn}
              icon={
                isClockInLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <MaterialCommunityIcons name="video-input-antenna" size={20} color="#000000" />
                )
              }
            />
          ) : (
            <Button
              variant="primary"
              label={isAfterClockOut ? '퇴근' : '퇴근하기'}
              disabled={isClockOutLoading || !currentLocation || invalidLocation || isAfterClockOut}
              onPress={handleClockOut}
              icon={
                isClockOutLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : isAfterClockOut ? (
                  <FontAwesome6 name="dragon" size={20} color="#000000" />
                ) : (
                  <Ionicons name="bus-outline" size={20} color="#000000" />
                )
              }
            />
          )}
        </Reanimated.View>
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
      <Text className="text-sm font-semibold text-muted dark:text-muted-dark">{label}</Text>
      <Text className="text-sm font-bold text-content dark:text-content-dark" style={TABULAR}>
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

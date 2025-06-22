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

  return (
    <>
      <View className="flex size-full flex-col items-center">
        {/* headers */}
        <View className="w-full px-2">
          <View className="flex flex-row items-center gap-4">
            {/* backward */}
            <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
              <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
            </TouchableOpacity>

            {/* today */}
            <View className="flex flex-row items-end gap-1">
              <Text className="text-xl font-bold dark:text-white">{dayjs().format('MM월 DD일')}</Text>
              <Text
                className={cx('text-base font-bold', {
                  'text-black dark:text-white': !WEEKEND_DAYS.includes(dayjs().day()),
                  'text-blue-500 dark:text-blue-300': dayjs().day() === 6,
                  'text-red-600 dark:text-red-300': dayjs().day() === 0,
                })}
              >
                ({getDaysOfWeek(dayjs().day())})
              </Text>
            </View>
          </View>
        </View>

        {/* select work type */}
        <View className="mt-8 w-full">
          <View className="flex flex-col items-center gap-3">
            <View className="w-full">
              <Text className="text-base font-bold text-gray-400">근무 위치</Text>
            </View>
            <View className="w-full">
              <View className="flex flex-row items-center gap-3">
                <TouchableOpacity
                  className={cx('flex h-12 w-24 flex-row items-center justify-center gap-1 rounded-xl', {
                    'bg-gray-100 dark:bg-gray-900': workType !== 'OFFICE',
                    'bg-gray-700 dark:bg-gray-300': workType === 'OFFICE',
                  })}
                  disabled={workType === 'OFFICE' || today?.status !== 'WAITING'}
                  onPress={() => setWorkType('OFFICE')}
                >
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={18}
                    color={
                      workType === 'OFFICE'
                        ? theme === 'light'
                          ? '#f3f4f6'
                          : 'black'
                        : theme === 'light'
                          ? 'black'
                          : '#f3f4f6'
                    }
                  />
                  <Text
                    className={cx('text-sm font-bold', {
                      'text-gray-600 dark:text-white': workType !== 'OFFICE',
                      'text-gray-100 dark:text-gray-800': workType === 'OFFICE',
                    })}
                  >
                    사무실
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={cx('flex h-12 w-24 flex-row items-center justify-center gap-1 rounded-xl', {
                    'bg-gray-100 dark:bg-gray-900': workType !== 'OUTSIDE',
                    'bg-gray-700 dark:bg-gray-300': workType === 'OUTSIDE',
                  })}
                  disabled={workType === 'OUTSIDE' || today?.status !== 'WAITING'}
                  onPress={() => setWorkType('OUTSIDE')}
                >
                  <FontAwesome
                    name="car"
                    size={18}
                    color={
                      workType === 'OUTSIDE'
                        ? theme === 'light'
                          ? '#f3f4f6'
                          : 'black'
                        : theme === 'light'
                          ? 'black'
                          : '#f3f4f6'
                    }
                  />
                  <Text
                    className={cx('text-sm font-bold', {
                      'text-gray-600 dark:text-white': workType !== 'OUTSIDE',
                      'text-gray-100 dark:text-gray-800': workType === 'OUTSIDE',
                    })}
                  >
                    외근
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={cx('flex h-12 w-24 flex-row items-center justify-center gap-1 rounded-xl', {
                    'bg-gray-100 dark:bg-gray-900': workType !== 'HOME',
                    'bg-gray-700 dark:bg-gray-300': workType === 'HOME',
                  })}
                  disabled={workType === 'HOME' || today?.status !== 'WAITING'}
                  onPress={() => setWorkType('HOME')}
                >
                  <Ionicons
                    name="home-sharp"
                    size={18}
                    color={
                      workType === 'HOME'
                        ? theme === 'light'
                          ? '#f3f4f6'
                          : 'black'
                        : theme === 'light'
                          ? 'black'
                          : '#f3f4f6'
                    }
                  />
                  <Text
                    className={cx('text-sm font-bold', {
                      'text-gray-600 dark:text-white': workType !== 'HOME',
                      'text-gray-100 dark:text-gray-800': workType === 'HOME',
                    })}
                  >
                    재택근무
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 출근 or 퇴근 */}
        <View className="mt-10 w-full">
          {/* 출근 */}
          {!today?.clockInTime && (
            <View className="">
              <View className="flew flex-col items-center justify-center gap-3">
                {/* 달리기 */}
                <View className="flex w-full items-center justify-center">
                  <LottieView style={{ width: 130, height: 130 }} source={SplashLottie} autoPlay loop />
                </View>

                <View className="">
                  <TouchableOpacity
                    className={cx(
                      'flex h-14 w-48 flex-row items-center justify-center gap-3 rounded-xl',
                      isClockInLoading || !currentLocation || invalidLocation ? 'bg-blue-300' : 'bg-blue-500',
                    )}
                    disabled={isClockInLoading || invalidLocation || !currentLocation}
                    onPress={handleClockIn}
                  >
                    {isClockInLoading ? (
                      <ActivityIndicator size="small" color={theme === 'light' ? '#d1d5db' : '#4b5563'} />
                    ) : (
                      <MaterialCommunityIcons name="video-input-antenna" size={24} color="white" />
                    )}
                    <Text className="text-lg font-bold text-white">출근하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 퇴근 */}
          {today?.clockInTime && (
            <View className="flew flex-col items-center justify-center gap-3">
              {/* 일하기 */}
              <View className="flex w-full items-center justify-center">
                {today?.clockOutTime ? (
                  <LottieView style={{ width: 130, height: 130 }} source={WalkLottie} autoPlay loop />
                ) : (
                  <LottieView style={{ width: 130, height: 130 }} source={WorkingLottie} autoPlay loop />
                )}
              </View>

              <View className="">
                <TouchableOpacity
                  className={cx(
                    'flex h-14 w-48 flex-row items-center justify-center gap-3 rounded-xl',
                    isClockOutLoading || !currentLocation || invalidLocation || !!today?.clockOutTime
                      ? 'bg-gray-500'
                      : 'bg-gray-800',
                  )}
                  disabled={isClockOutLoading || !currentLocation || invalidLocation || !!today?.clockOutTime}
                  onPress={handleClockOut}
                >
                  {isClockOutLoading ? (
                    <ActivityIndicator size="small" color={theme === 'light' ? '#d1d5db' : '#4b5563'} />
                  ) : today?.clockOutTime ? (
                    <FontAwesome6 name="dragon" size={24} color="white" />
                  ) : (
                    <Ionicons name="bus-outline" size={24} color="white" />
                  )}

                  <Text className="text-lg font-bold text-white">{today?.clockOutTime ? '퇴근' : '퇴근하기'}</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-5 w-full">
                <View className="flex flex-row items-center gap-4">
                  <View className="w-32 flex-none">
                    <Text className="text-right text-lg font-bold text-gray-500">출근 시간: </Text>
                  </View>

                  <View className="">
                    <Text className="text-lg font-bold text-gray-500">
                      {dayjs(today?.clockInTime).format('YYYY-MM-DD A hh:mm')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="w-full">
                <View className="flex flex-row items-center gap-4">
                  <View className="w-32 flex-none">
                    <Text className="text-right text-lg font-bold text-gray-500">목표 퇴근 시간: </Text>
                  </View>

                  <View className="">
                    <Text className="text-lg font-bold text-gray-500">
                      {dayjs(today?.leaveWorkAt).format('YYYY-MM-DD A hh:mm')}
                    </Text>
                  </View>
                </View>
              </View>

              {today?.clockOutTime && (
                <View className="w-full">
                  <View className="flex flex-row items-center gap-4">
                    <View className="w-32 flex-none">
                      <Text className="text-right text-lg font-bold text-gray-500">퇴근 시간: </Text>
                    </View>

                    <View className="">
                      <Text className="text-lg font-bold text-gray-500">
                        {dayjs(today.clockOutTime).format('YYYY-MM-DD A hh:mm')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
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

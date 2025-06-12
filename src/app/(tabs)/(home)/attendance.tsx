import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native';

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { Entypo, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import SplashLottie from '@/assets/lotties/splash-lottie.json';
import WalkLottie from '@/assets/lotties/walk.json';
import WorkingLottie from '@/assets/lotties/working-logo.json';
import { useAttendanceLocations } from '@/domain/attendances/queries/attendanceGps';
import { useClockIn, useClockOut, useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { isSameMarginOfError } from '@/utils/dataUtils';
import { getDaysOfWeek, round } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import LottieView from 'lottie-react-native';

const WEEKEND_DAYS = [0, 6];

export default function Attendance() {
  // context
  const { theme } = useContext(ThemeContext);

  // state
  const [workType, setWorkType] = useState<AttendanceWorkType>('OFFICE');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>();

  // queries
  const { locations } = useAttendanceLocations();
  const { today } = useTodayAttendance();
  const { clockIn, isLoading: isClockInLoading } = useClockIn({});
  const { clockOut, isLoading: isClockOutLoading } = useClockOut({});

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

  useEffect(() => {}, [workType]);

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

    setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
  };

  const handleClockIn = () => {
    currentLocation && clockIn({ ...currentLocation, workType });
  };

  const handleClockOut = () => {
    console.log(today, currentLocation);

    today && currentLocation && clockOut({ ...currentLocation, attendanceRecordId: today.id });
  };

  return (
    <View className="flex size-full flex-col items-center px-4 py-2">
      {/* headers */}
      <View className="w-full px-2">
        <View className="flex flex-row items-center gap-4">
          {/* backward */}
          <TouchableOpacity className="items-center justify-center" onPress={() => router.back()}>
            <Entypo name="chevron-left" size={30} color={theme === 'light' ? 'black' : 'white'} />
          </TouchableOpacity>

          {/* today */}
          <View className="flex flex-row items-end gap-1">
            <Text className="text-3xl font-bold dark:text-white">{dayjs().format('MM월 DD일')}</Text>
            <Text
              className={cx('text-xl font-bold', {
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
                className={cx('flex h-14 w-28 flex-row items-center justify-center gap-1 rounded-xl', {
                  'bg-gray-100': workType !== 'OFFICE',
                  'bg-gray-700': workType === 'OFFICE',
                })}
                disabled={workType === 'OFFICE'}
                onPress={() => setWorkType('OFFICE')}
              >
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={20}
                  color={workType === 'OFFICE' ? '#f3f4f6' : 'black'}
                />
                <Text
                  className={cx('font-bold', {
                    'text-gray-600': workType !== 'OFFICE',
                    'text-gray-100': workType === 'OFFICE',
                  })}
                >
                  사무실
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={cx('flex h-14 w-28 flex-row items-center justify-center gap-1 rounded-xl', {
                  'bg-gray-100': workType !== 'OUTSIDE',
                  'bg-gray-700': workType === 'OUTSIDE',
                })}
                disabled={workType === 'OUTSIDE'}
                onPress={() => setWorkType('OUTSIDE')}
              >
                <FontAwesome name="car" size={20} color={workType === 'OUTSIDE' ? '#f3f4f6' : 'black'} />
                <Text
                  className={cx('font-bold', {
                    'text-gray-600': workType !== 'OUTSIDE',
                    'text-gray-100': workType === 'OUTSIDE',
                  })}
                >
                  외근
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={cx('flex h-14 w-28 flex-row items-center justify-center gap-1 rounded-xl', {
                  'bg-gray-100': workType !== 'HOME',
                  'bg-gray-700': workType === 'HOME',
                })}
                disabled={workType === 'HOME'}
                onPress={() => setWorkType('HOME')}
              >
                <Ionicons name="home-sharp" size={20} color={workType === 'HOME' ? '#f3f4f6' : 'black'} />
                <Text
                  className={cx('font-bold', {
                    'text-gray-600': workType !== 'HOME',
                    'text-gray-100': workType === 'HOME',
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
                    isClockInLoading ? 'bg-blue-300' : 'bg-blue-500',
                  )}
                  disabled={isClockInLoading}
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
                  isClockOutLoading || !!today?.clockOutTime ? 'bg-gray-500' : 'bg-gray-800',
                )}
                disabled={isClockOutLoading || !!today?.clockOutTime}
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

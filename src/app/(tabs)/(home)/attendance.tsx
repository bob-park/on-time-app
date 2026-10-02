import { useContext, useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Linking, Text, View } from 'react-native';

import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { endWorkActivity, startWorkActivity } from '@/domain/attendances/liveActivity';
import { useAttendanceLocations } from '@/domain/attendances/queries/attendanceGps';
import { useClockIn, useClockOut, useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import { Icon } from '@/shared/components/Icon';
import { Button, ChoiceChip, usePalette } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { NotificationContext } from '@/shared/providers/notification/NotificationProvider';
import { isSameMarginOfError } from '@/utils/dataUtils';
import { round } from '@/utils/parse';

const TABULAR = { fontVariant: ['tabular-nums' as const] };

const WORK_TYPES: { key: AttendanceWorkType; label: string; sf: string; fallback: string }[] = [
  { key: 'OFFICE', label: '사무실', sf: 'building.2', fallback: '🏢' },
  { key: 'OUTSIDE', label: '외근', sf: 'car', fallback: '🚗' },
  { key: 'HOME', label: '재택', sf: 'house', fallback: '🏠' },
];

type LocationStatus = 'checking' | 'valid' | 'invalid' | 'denied';

const LOCATION_STATUS: Record<LocationStatus, { title: string; box: string; text: string }> = {
  checking: {
    title: '위치를 확인하는 중...',
    box: 'bg-elevated dark:bg-elevated-dark',
    text: 'text-muted dark:text-muted-dark',
  },
  valid: { title: '위치 확인됨', box: 'bg-success-subtle', text: 'text-success-strong dark:text-success' },
  invalid: { title: '근무지 반경 밖이에요', box: 'bg-danger-subtle', text: 'text-danger dark:text-danger-dark' },
  denied: { title: '위치 권한이 필요해요', box: 'bg-danger-subtle', text: 'text-danger dark:text-danger-dark' },
};

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

export default function Attendance() {
  // context
  const { showToast } = useContext(NotificationContext);

  // hooks
  const router = useRouter();
  const palette = usePalette();

  // state
  const [now, setNow] = useState(() => dayjs());
  const [workType, setWorkType] = useState<AttendanceWorkType>('OFFICE');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>();
  const [invalidLocation, setInvalidLocation] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string>();

  // queries
  const { locations } = useAttendanceLocations();
  const { today } = useTodayAttendance();
  const { clockIn, isLoading: isClockInLoading } = useClockIn({
    onSuccess: (data) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.back();

      showToast({
        title: '출근 완료',
        description: `${dayjs(data.clockInTime).format('HH:mm')} ${parseWorkType(data.workType)}(으)로 출근 처리하였습니다.`,
      });

      // iOS Live Activity 시작 (실패해도 출근 플로우를 막지 않는다)
      const clockInAt = dayjs(data.clockInTime ?? undefined).toISOString();
      const targetLeaveAt = data.leaveWorkAt
        ? dayjs(data.leaveWorkAt).toISOString()
        : dayjs(data.clockInTime ?? undefined)
            .add(8, 'hour')
            .toISOString();
      startWorkActivity({ clockInAt, targetLeaveAt }).catch((err) => console.error('[LiveActivity] start failed', err));
    },
  });
  const { clockOut, isLoading: isClockOutLoading } = useClockOut({
    onSuccess: (data) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.back();

      showToast({
        title: '퇴근 완료',
        description: `${dayjs(data.clockOutTime).format('HH:mm')} ${parseWorkType(data.workType)}(으)로 퇴근 처리하였습니다.`,
      });

      // iOS Live Activity 종료 (실패해도 퇴근 플로우를 막지 않는다)
      endWorkActivity().catch((err) => console.error('[LiveActivity] end failed', err));
    },
  });

  // useEffect
  useEffect(() => {
    const intervalId = setInterval(() => setNow(dayjs()), 10_000);
    return () => clearInterval(intervalId);
  }, []);

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

  // handle
  const handleGetCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setPermissionDenied(true);
      Alert.alert('위치 권한이 필요해요', '출퇴근 기록을 위해 설정에서 위치 권한을 허용해 주세요.', [
        { text: '설정 열기', onPress: () => Linking.openSettings() },
        { text: '취소' },
      ]);
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
    setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
  };

  const handleClockIn = () => {
    currentLocation && clockIn({ ...currentLocation, workType });
  };

  const handleClockOut = () => {
    today && currentLocation && clockOut({ ...currentLocation, attendanceRecordId: today.id });
  };

  const isBeforeClockIn = !today?.clockInTime;
  const isAfterClockOut = !!today?.clockOutTime;
  const isBusy = isClockInLoading || isClockOutLoading;

  const status: LocationStatus = permissionDenied
    ? 'denied'
    : !currentLocation
      ? 'checking'
      : invalidLocation
        ? 'invalid'
        : 'valid';
  const statusStyle = LOCATION_STATUS[status];
  const canSubmit = status === 'valid' && !isBusy && !isAfterClockOut;

  const title = isBeforeClockIn ? '출근하기' : isAfterClockOut ? '근무 완료' : '퇴근하기';

  return (
    <View className="flex-1 pb-8">
      {/* header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-content dark:text-content-dark text-lg font-bold">{title}</Text>
        <Text className="text-muted dark:text-muted-dark text-xs">{now.format('M월 D일 dddd')}</Text>
      </View>
      <Text
        className="text-content dark:text-content-dark mt-3 text-[40px] leading-none font-bold tracking-tighter"
        style={TABULAR}
      >
        {now.format('HH:mm')}
      </Text>

      {/* work type */}
      {isBeforeClockIn && (
        <>
          <Text className="text-muted dark:text-muted-dark mt-6 mb-2 text-[11px] font-semibold tracking-wider">
            근무 형태
          </Text>
          <View className="flex-row gap-2">
            {WORK_TYPES.map((option) => (
              <ChoiceChip
                key={option.key}
                label={option.label}
                selected={workType === option.key}
                disabled={today?.status !== 'WAITING'}
                icon={
                  <Icon
                    sf={option.sf}
                    fallback={option.fallback}
                    size={15}
                    color={workType === option.key ? palette.brand : palette.content}
                  />
                }
                onPress={() => setWorkType(option.key)}
              />
            ))}
          </View>
        </>
      )}

      {/* location status */}
      <View className={`mt-4 flex-row items-center gap-3 rounded-2xl p-3.5 ${statusStyle.box}`}>
        {status === 'checking' ? (
          <ActivityIndicator size="small" color={palette.muted} />
        ) : (
          <Icon
            sf="location.fill"
            fallback="📍"
            size={18}
            color={status === 'valid' ? palette.success : palette.danger}
          />
        )}
        <View className="flex-1">
          <Text className={`text-[13px] font-bold ${statusStyle.text}`}>{statusStyle.title}</Text>
          {currentAddress ? (
            <Text className="text-muted dark:text-muted-dark mt-0.5 text-xs" numberOfLines={1}>
              {currentAddress}
            </Text>
          ) : null}
        </View>
      </View>

      {/* time info */}
      {!isBeforeClockIn && (
        <View className="mt-4 gap-2">
          <TimeInfoRow label="출근 시간" value={today?.clockInTime ? dayjs(today.clockInTime).format('HH:mm') : '-'} />
          <TimeInfoRow label="목표 퇴근" value={today?.leaveWorkAt ? dayjs(today.leaveWorkAt).format('HH:mm') : '-'} />
          {isAfterClockOut && <TimeInfoRow label="퇴근 시간" value={dayjs(today?.clockOutTime).format('HH:mm')} />}
        </View>
      )}

      {/* CTA */}
      <View className="mt-auto pt-4">
        <Button
          label={isAfterClockOut ? '퇴근 완료' : title}
          disabled={!canSubmit}
          onPress={isBeforeClockIn ? handleClockIn : handleClockOut}
          icon={isBusy ? <ActivityIndicator size="small" color="#ffffff" /> : undefined}
        />
      </View>
    </View>
  );
}

function TimeInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-muted dark:text-muted-dark text-sm">{label}</Text>
      <Text className="text-content dark:text-content-dark text-sm font-bold" style={TABULAR}>
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

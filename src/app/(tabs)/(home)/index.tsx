import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import { useNotificationHistories } from '@/domain/notification/queries/userNotification';
import dayjs from '@/shared/dayjs';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDaysOfWeek, getDuration, parseTimeFormat } from '@/utils/parse';
import { TimeCode } from '@/utils/timecode/TimeCode';

const ONE_HOUR = 3_600;

type WorkState = 'before' | 'working' | 'overtime' | 'done';

function getWorkState(today: any): WorkState {
  if (!today?.clockInTime) return 'before';
  if (today?.clockOutTime) return 'done';
  if (today?.leaveWorkAt && dayjs(today.leaveWorkAt).unix() - dayjs().unix() < 0) return 'overtime';
  return 'working';
}

// Hero Card - State A: 출근 전
function HeroBeforeWork({ today }: { today: any }) {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#007AFF', '#0A84FF', '#34AADC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 20, minHeight: 200, overflow: 'hidden' }}
    >
      {/* badge */}
      <View className="mb-3 flex-row items-center gap-1.5 self-start rounded-full bg-white/20 px-2.5 py-1">
        <View className="size-2.5 rounded-full bg-white" />
        <Text className="text-xs font-semibold text-white/90">정상근무</Text>
      </View>

      <Text className="mb-1 text-[15px] text-white/75">아직 출근 전이에요</Text>
      <Text className="mb-4 text-[26px] font-bold text-white">오늘도 화이팅!</Text>

      {/* stats */}
      <View className="mb-5 flex-row gap-4">
        <View>
          <Text className="text-[11px] font-medium text-white/60">오늘 예정</Text>
          <Text className="text-[15px] font-bold text-white">09:00 출근</Text>
        </View>
        <View>
          <Text className="text-[11px] font-medium text-white/60">목표 퇴근</Text>
          <Text className="text-[15px] font-bold text-white">
            {today?.leaveWorkAt ? dayjs(today.leaveWorkAt).format('HH:mm') : '18:00'}
          </Text>
        </View>
      </View>

      {/* CTA */}
      <Pressable
        className="items-center rounded-2xl border-[1.5px] border-white/35 bg-white/20 px-4 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-[15px] font-bold text-white">출근 입력 →</Text>
      </Pressable>
    </LinearGradient>
  );
}

// Hero Card - State B: 근무 중
function HeroWorking({
  today,
  remainingTime,
}: {
  today: any;
  remainingTime: { isOvertime: boolean; time: TimeCode | false };
}) {
  const router = useRouter();

  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const leaveWorkAt = today?.leaveWorkAt ? dayjs(today.leaveWorkAt) : null;

  const progress = useMemo(() => {
    if (!clockInTime || !leaveWorkAt) return 0;
    const total = leaveWorkAt.unix() - clockInTime.unix();
    const elapsed = dayjs().unix() - clockInTime.unix();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  }, [clockInTime, leaveWorkAt, remainingTime]);

  const remainingLabel = remainingTime.time
    ? `${remainingTime.time.formatHours.padStart(2, '0')}h ${remainingTime.time.formatMinutes.padStart(2, '0')}m`
    : '';

  return (
    <LinearGradient
      colors={['#007AFF', '#005EC4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, padding: 20, minHeight: 230, overflow: 'hidden' }}
    >
      {/* header */}
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/65">목표 퇴근</Text>
          <Text className="text-4xl font-bold leading-none text-white">
            {leaveWorkAt?.format('HH:mm')}{' '}
            <Text className="text-lg font-medium text-white/60">
              {leaveWorkAt && leaveWorkAt.hour() >= 12 ? 'PM' : 'AM'}
            </Text>
          </Text>
        </View>
        <View className="items-end">
          <Text className="mb-0.5 text-[11px] font-semibold text-white/55">남은 시간</Text>
          <Text className="text-[22px] font-bold leading-tight text-[#ADE1FF]">{remainingLabel}</Text>
        </View>
      </View>

      {/* progress */}
      <View className="mb-3.5">
        <View className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <View className="h-full rounded-full bg-white/85" style={{ width: `${progress}%` }} />
        </View>
        <View className="mt-1.5 flex-row justify-between">
          <Text className="text-[10px] text-white/50">{clockInTime?.format('HH:mm')} 출근</Text>
          <Text className="text-[10px] text-white/50">{Math.round(progress)}% 완료</Text>
        </View>
      </View>

      {/* footer */}
      <View className="mb-4 flex-row items-center gap-3.5">
        <View className="flex-row items-center gap-1.5">
          <View
            className="size-[7px] rounded-full bg-[#34C759]"
            style={{ shadowColor: '#34C759', shadowRadius: 6, shadowOpacity: 1 }}
          />
          <Text className="text-xs font-medium text-white/75">Active Shift</Text>
        </View>
      </View>

      {/* CTA */}
      <Pressable
        className="items-center rounded-2xl border-[1.5px] border-white/35 bg-white/20 px-4 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-[15px] font-bold text-white">퇴근 입력 🚀</Text>
      </Pressable>
    </LinearGradient>
  );
}

// Hero Card - State B Overtime: 초과근무
function HeroOvertime({
  today,
  remainingTime,
}: {
  today: any;
  remainingTime: { isOvertime: boolean; time: TimeCode | false };
}) {
  const router = useRouter();

  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const leaveWorkAt = today?.leaveWorkAt ? dayjs(today.leaveWorkAt) : null;

  const overtimeLabel = remainingTime.time
    ? `+${remainingTime.time.formatHours.padStart(2, '0')}h ${remainingTime.time.formatMinutes.padStart(2, '0')}m`
    : '';

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 20,
        padding: 20,
        minHeight: 230,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,107,107,0.3)',
      }}
    >
      {/* header */}
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/65">목표 퇴근</Text>
          <Text className="text-4xl font-bold leading-none text-white">
            {leaveWorkAt?.format('HH:mm')}{' '}
            <Text className="text-lg font-medium text-white/50">
              {leaveWorkAt && leaveWorkAt.hour() >= 12 ? 'PM' : 'AM'}
            </Text>
          </Text>
        </View>
        <View className="items-end">
          <Text className="mb-0.5 text-[11px] font-semibold text-white/55">초과 근무</Text>
          <Text className="text-[22px] font-bold leading-tight text-[#FF6B6B]">{overtimeLabel}</Text>
        </View>
      </View>

      {/* progress - overflow */}
      <View className="mb-3.5">
        <View className="h-1.5 overflow-visible rounded-full bg-white/10">
          <View className="h-full rounded-full bg-[#FF6B6B]/85" style={{ width: '100%' }} />
        </View>
        <View className="mt-1.5 flex-row justify-between">
          <Text className="text-[10px] text-white/40">{clockInTime?.format('HH:mm')} 출근</Text>
          <Text className="text-[10px] text-[#FF6B6B]">{leaveWorkAt?.format('HH:mm')} 초과</Text>
        </View>
      </View>

      {/* footer */}
      <View className="mb-4 flex-row items-center gap-3.5">
        <View className="flex-row items-center gap-1.5">
          <View
            className="size-[7px] rounded-full bg-[#FF6B6B]"
            style={{ shadowColor: '#FF6B6B', shadowRadius: 6, shadowOpacity: 1 }}
          />
          <Text className="text-xs font-medium text-white/60">Active Shift</Text>
        </View>
        <Text className="text-xs font-bold text-[#FF6B6B]">{overtimeLabel} 초과 중</Text>
      </View>

      {/* CTA */}
      <Pressable
        className="items-center rounded-2xl border-[1.5px] border-[#FF6B6B]/40 bg-[#FF6B6B]/15 px-4 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-[15px] font-bold text-white">퇴근 입력 🚀</Text>
      </Pressable>
    </LinearGradient>
  );
}

// Hero Card - State C: 퇴근 후
function HeroDone({ today }: { today: any }) {
  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const clockOutTime = today?.clockOutTime ? dayjs(today.clockOutTime) : null;

  const workDurations = today?.clockInTime && today?.clockOutTime && getDuration(today.clockInTime, today.clockOutTime);
  const durationText = workDurations
    ? parseTimeFormat(
        workDurations -
          (workDurations > ONE_HOUR * 8 ||
          isIncludeTime(
            {
              from: today?.clockInTime || dayjs(today?.workingDate).hour(0).toDate(),
              to: today?.clockOutTime || dayjs(today?.workingDate).hour(0).toDate(),
            },
            dayjs(today?.workingDate).hour(12).toDate(),
          )
            ? ONE_HOUR
            : 0),
      )
    : '';

  return (
    <View
      className="rounded-[20px] border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
      style={{
        minHeight: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      }}
    >
      {/* badge */}
      <View className="mb-3 flex-row items-center gap-1.5 self-start rounded-full bg-green-50 px-2.5 py-1 dark:bg-green-900/30">
        <Text className="text-xs">✅</Text>
        <Text className="text-[11px] font-semibold text-green-700 dark:text-green-400">오늘 수고했어요</Text>
      </View>

      <Text className="mb-1 text-[17px] font-bold dark:text-white">퇴근 완료</Text>

      {/* times */}
      <View className="mb-1 mt-2.5 flex-row items-center gap-2">
        <Text className="text-xl font-bold dark:text-white">{clockInTime?.format('HH:mm')}</Text>
        <Text className="text-[15px] text-gray-400">→</Text>
        <Text className="text-xl font-bold dark:text-white">{clockOutTime?.format('HH:mm')}</Text>
      </View>

      <Text className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">총 근무 {durationText}</Text>
    </View>
  );
}

// Action Grid Item
function ActionCard({
  icon,
  iconBg,
  label,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className="flex-1 rounded-2xl bg-white p-3.5 dark:bg-gray-900"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }}
      onPress={onPress}
    >
      <View className="mb-1.5 size-9 items-center justify-center rounded-lg" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text className="text-[13px] font-semibold dark:text-white">{label}</Text>
      <Text className="text-[11px] text-gray-500 dark:text-gray-400">{sub}</Text>
    </Pressable>
  );
}

export default function HomeIndex() {
  const { theme } = useContext(ThemeContext);
  const router = useRouter();

  const { today, reloadToday } = useTodayAttendance();
  const { pages } = useNotificationHistories({ page: 0, size: 25 });
  const notifications = pages.reduce(
    (current, value) => current.concat(value.content),
    [] as UserNotificationHistory[],
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reloadToday();
    setRefreshing(false);
  }, [reloadToday]);

  const [remainingTime, setRemainingTime] = useState<{ isOvertime: boolean; time: TimeCode | false }>({
    isOvertime: false,
    time: false,
  });

  useEffect(() => {
    calculateRemainingTime();
    const intervalId = setInterval(() => calculateRemainingTime(), 1_000);
    return () => clearInterval(intervalId);
  }, [today]);

  const calculateRemainingTime = () => {
    setRemainingTime({
      isOvertime: dayjs(today?.leaveWorkAt).unix() - dayjs().unix() < 0,
      time: !!today?.leaveWorkAt && new TimeCode(Math.abs(dayjs(today?.leaveWorkAt).unix() - dayjs().unix())),
    });
  };

  const workState = getWorkState(today);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Page Header */}
      <View className="flex-row items-center justify-between px-5 pb-1 pt-2">
        <View>
          <Text className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
            {dayjs().format('YYYY년 M월 D일')} {getDaysOfWeek(dayjs().day())}요일
          </Text>
          <Text className="text-[22px] font-bold leading-tight dark:text-white">오늘</Text>
        </View>
        <Pressable
          className="size-9 items-center justify-center rounded-full bg-white dark:bg-gray-800"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
          onPress={() => router.push('./notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color={theme === 'light' ? '#1C1C1E' : '#FFFFFF'} />
          {notifications.some((n) => !n.isRead) && (
            <View className="absolute right-0 top-0 size-2.5 rounded-full bg-red-500" />
          )}
        </Pressable>
      </View>

      {/* Hero Card */}
      <View className="mx-4 mt-3">
        {workState === 'before' && <HeroBeforeWork today={today} />}
        {workState === 'working' && <HeroWorking today={today} remainingTime={remainingTime} />}
        {workState === 'overtime' && <HeroOvertime today={today} remainingTime={remainingTime} />}
        {workState === 'done' && <HeroDone today={today} />}
      </View>

      {/* Action Grid 2x2 */}
      <View className="mx-4 mt-3 flex-row gap-2.5">
        <View className="flex-1 gap-2.5">
          <ActionCard
            icon={<MaterialCommunityIcons name="calendar-plus" size={18} color="#1A7A3A" />}
            iconBg="#E8F8F0"
            label="휴가 신청"
            sub="연차·반차 신청"
            onPress={() => router.push('./dayoff/add')}
          />
          <ActionCard
            icon={<MaterialCommunityIcons name="file-document-outline" size={18} color="#7A00B0" />}
            iconBg="#FEE8FF"
            label="휴가 내역"
            sub="사용·잔여 내역"
            onPress={() => router.push('./dayoff/histories')}
          />
        </View>
        <View className="flex-1 gap-2.5">
          <ActionCard
            icon={<MaterialCommunityIcons name="clock-outline" size={18} color="#0048B0" />}
            iconBg="#E5F0FF"
            label="근무 확인"
            sub="이번 달 현황"
          />
          <ActionCard
            icon={<MaterialIcons name="person-outline" size={18} color="#48484A" />}
            iconBg="#F2F2F7"
            label="내 정보"
            sub="프로필·설정"
          />
        </View>
      </View>
    </ScrollView>
  );
}

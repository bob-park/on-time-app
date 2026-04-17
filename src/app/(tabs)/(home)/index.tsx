import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import { useNotificationHistories } from '@/domain/notification/queries/userNotification';
import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';
import { enterHero, enterPage } from '@/shared/components/motion/entering';
import dayjs from '@/shared/dayjs';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDaysOfWeek, getDuration, parseTimeFormat } from '@/utils/parse';
import { TimeCode } from '@/utils/timecode/TimeCode';

import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ONE_HOUR = 3_600;
const WEEKEND_DAYS = [0, 6];

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
      style={{ borderRadius: 24, padding: 24, minHeight: 220, overflow: 'hidden' }}
    >
      {/* badge */}
      <View className="mb-4 flex-row items-center gap-1.5 self-start rounded-full bg-white/20 px-2.5 py-1">
        <View className="size-2 rounded-full bg-white" />
        <Text className="text-xs font-semibold text-white/90">정상 근무 예정</Text>
      </View>

      <Text className="text-sm text-white/75">아직 출근 전이에요</Text>
      <Text className="mt-1 text-[28px] font-bold leading-tight text-white">오늘도 화이팅!</Text>

      {/* stats */}
      <View className="mt-6 flex-row gap-8">
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/55">예정 출근</Text>
          <Text className="text-base font-bold text-white" style={{ fontVariant: ['tabular-nums'] }}>
            09:00
          </Text>
        </View>
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/55">목표 퇴근</Text>
          <Text className="text-base font-bold text-white" style={{ fontVariant: ['tabular-nums'] }}>
            {today?.leaveWorkAt ? dayjs(today.leaveWorkAt).format('HH:mm') : '18:00'}
          </Text>
        </View>
      </View>

      {/* CTA */}
      <AnimatedPressable
        className="mt-6 items-center rounded-2xl border border-white/30 bg-white/20 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-base font-bold text-white">출근 입력</Text>
      </AnimatedPressable>
    </LinearGradient>
  );
}

// Hero Card - Weekend: 주말 (출근 가능)
function HeroWeekend() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#6B7280', '#4B5563', '#374151']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24, padding: 24, minHeight: 220, overflow: 'hidden' }}
    >
      {/* badge */}
      <View className="mb-4 flex-row items-center gap-1.5 self-start rounded-full bg-white/20 px-2.5 py-1">
        <Ionicons name="moon" size={11} color="rgba(255,255,255,0.9)" />
        <Text className="text-xs font-semibold text-white/90">주말</Text>
      </View>

      <Text className="text-sm text-white/75">오늘은 주말이에요</Text>
      <Text className="mt-1 text-[28px] font-bold leading-tight text-white">푹 쉬세요</Text>

      <Text className="mt-6 text-[13px] leading-relaxed text-white/55">
        출근이 필요하면{'\n'}아래 버튼을 눌러주세요
      </Text>

      {/* CTA */}
      <AnimatedPressable
        className="mt-6 items-center rounded-2xl border border-white/30 bg-white/20 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-base font-bold text-white">출근 입력</Text>
      </AnimatedPressable>
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

  // smoothly animate the progress bar width instead of snapping on every tick
  const progressSv = useSharedValue(0);
  useEffect(() => {
    progressSv.value = withTiming(progress, { duration: 600, easing: Easing.bezier(0.25, 1, 0.5, 1) });
  }, [progress, progressSv]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressSv.value}%` }));

  // subtle breathing pulse on the "working" status dot
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const remainingLabel = remainingTime.time
    ? `${remainingTime.time.formatHours.padStart(2, '0')}:${remainingTime.time.formatMinutes.padStart(2, '0')}`
    : '';

  return (
    <LinearGradient
      colors={['#007AFF', '#005EC4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24, padding: 24, minHeight: 248, overflow: 'hidden' }}
    >
      {/* header — 숫자가 주인공 */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/60">목표 퇴근</Text>
          <Text
            className="mt-1 text-[44px] font-bold leading-none text-white"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {leaveWorkAt?.format('HH:mm')}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/60">남은 시간</Text>
          <Text
            className="mt-1 text-2xl font-bold leading-tight text-[#ADE1FF]"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {remainingLabel}
          </Text>
        </View>
      </View>

      {/* progress — width animated smoothly across ticks */}
      <View className="mt-6">
        <View className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <Reanimated.View className="h-full rounded-full bg-white/85" style={progressStyle} />
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-[11px] text-white/55" style={{ fontVariant: ['tabular-nums'] }}>
            {clockInTime?.format('HH:mm')} 출근
          </Text>
          <Text className="text-[11px] text-white/55" style={{ fontVariant: ['tabular-nums'] }}>
            {Math.round(progress)}% 완료
          </Text>
        </View>
      </View>

      {/* footer */}
      <View className="mt-4 flex-row items-center gap-2">
        <Reanimated.View
          className="size-2 rounded-full bg-[#34C759]"
          style={[{ shadowColor: '#34C759', shadowRadius: 6, shadowOpacity: 1 }, pulseStyle]}
        />
        <Text className="text-xs font-semibold text-white/80">근무중</Text>
      </View>

      {/* CTA */}
      <AnimatedPressable
        className="mt-5 items-center rounded-2xl border border-white/30 bg-white/20 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-base font-bold text-white">퇴근 입력</Text>
      </AnimatedPressable>
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
        borderRadius: 24,
        padding: 24,
        minHeight: 248,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,107,107,0.3)',
      }}
    >
      {/* header — 숫자가 주인공 */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/60">목표 퇴근</Text>
          <Text
            className="mt-1 text-[44px] font-bold leading-none text-white"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {leaveWorkAt?.format('HH:mm')}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-[#FF6B6B]/80">초과 근무</Text>
          <Text
            className="mt-1 text-2xl font-bold leading-tight text-[#FF6B6B]"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {overtimeLabel}
          </Text>
        </View>
      </View>

      {/* progress - overflow */}
      <View className="mt-6">
        <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <View className="h-full rounded-full bg-[#FF6B6B]/85" style={{ width: '100%' }} />
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-[11px] text-white/50" style={{ fontVariant: ['tabular-nums'] }}>
            {clockInTime?.format('HH:mm')} 출근
          </Text>
          <Text className="text-[11px] font-semibold text-[#FF6B6B]" style={{ fontVariant: ['tabular-nums'] }}>
            {leaveWorkAt?.format('HH:mm')} 초과
          </Text>
        </View>
      </View>

      {/* footer */}
      <View className="mt-4 flex-row items-center gap-2">
        <View
          className="size-2 animate-pulse rounded-full bg-[#FF6B6B]"
          style={{ shadowColor: '#FF6B6B', shadowRadius: 6, shadowOpacity: 1 }}
        />
        <Text className="text-xs font-semibold text-white/75">근무중 · 초과</Text>
      </View>

      {/* CTA */}
      <AnimatedPressable
        className="mt-5 items-center rounded-2xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/20 py-3.5"
        onPress={() => router.push('./attendance')}
      >
        <Text className="text-base font-bold text-white">퇴근 입력</Text>
      </AnimatedPressable>
    </LinearGradient>
  );
}

// Hero Card - State C: 퇴근 후
function HeroDone({ today }: { today: any }) {
  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const clockOutTime = today?.clockOutTime ? dayjs(today.clockOutTime) : null;
  const leaveWorkAt = today?.leaveWorkAt ? dayjs(today.leaveWorkAt) : null;

  const isOvertime = !!(clockOutTime && leaveWorkAt && clockOutTime.unix() > leaveWorkAt.unix());
  const overtimeSec = isOvertime ? clockOutTime!.unix() - leaveWorkAt!.unix() : 0;
  const overtimeText = isOvertime ? new TimeCode(overtimeSec) : null;

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

  if (isOvertime) {
    return (
      <LinearGradient
        colors={['#1A1A2E', '#16213E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 24,
          minHeight: 180,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255,107,107,0.3)',
        }}
      >
        {/* badge */}
        <View className="flex-row items-center gap-1.5 self-start rounded-full bg-[#FF6B6B]/20 px-2.5 py-1">
          <View className="size-1.5 rounded-full bg-[#FF6B6B]" />
          <Text className="text-[11px] font-semibold text-[#FF6B6B]">초과근무 후 퇴근</Text>
        </View>

        <Text className="mt-3 text-base font-semibold text-white/80">퇴근 완료</Text>

        {/* times — 숫자가 주인공 */}
        <View className="mt-3 flex-row items-baseline gap-3">
          <Text className="text-3xl font-bold text-white" style={{ fontVariant: ['tabular-nums'] }}>
            {clockInTime?.format('HH:mm')}
          </Text>
          <Text className="text-base text-white/40">→</Text>
          <Text className="text-3xl font-bold text-[#FF6B6B]" style={{ fontVariant: ['tabular-nums'] }}>
            {clockOutTime?.format('HH:mm')}
          </Text>
        </View>

        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-[13px] text-white/60">총 근무 {durationText}</Text>
          {overtimeText && (
            <Text
              className="text-[13px] font-semibold text-[#FF6B6B]"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              +{overtimeText.formatHours.padStart(2, '0')}:{overtimeText.formatMinutes.padStart(2, '0')} 초과
            </Text>
          )}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View
      className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
      style={{
        minHeight: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      }}
    >
      {/* badge */}
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-green-50 px-2.5 py-1 dark:bg-green-900/30">
        <View className="size-1.5 rounded-full bg-green-500" />
        <Text className="text-[11px] font-semibold text-green-700 dark:text-green-400">오늘 수고했어요</Text>
      </View>

      <Text className="mt-3 text-base font-semibold text-gray-500 dark:text-gray-400">퇴근 완료</Text>

      {/* times — 숫자가 주인공 */}
      <View className="mt-3 flex-row items-baseline gap-3">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontVariant: ['tabular-nums'] }}>
          {clockInTime?.format('HH:mm')}
        </Text>
        <Text className="text-base text-gray-400">→</Text>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontVariant: ['tabular-nums'] }}>
          {clockOutTime?.format('HH:mm')}
        </Text>
      </View>

      <Text className="mt-3 text-[13px] text-gray-500 dark:text-gray-400">총 근무 {durationText}</Text>
    </View>
  );
}

// Primary Action — 큰 카드 (휴가 관련 자주 쓰는 것)
function PrimaryActionCard({
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
    <AnimatedPressable
      className="flex-1 rounded-2xl bg-white p-4 dark:bg-gray-900"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }}
      onPress={onPress}
    >
      <View className="size-10 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text className="mt-3 text-sm font-bold text-gray-900 dark:text-white">{label}</Text>
      <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</Text>
    </AnimatedPressable>
  );
}

// Secondary Action — 리스트 row
function SecondaryActionRow({
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
    <AnimatedPressable className="flex-row items-center gap-3 px-4 py-3.5" onPress={onPress} scaleTo={0.98}>
      <View className="size-9 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-gray-900 dark:text-white">{label}</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </AnimatedPressable>
  );
}

// Skeleton shimmer block
function SkeletonBlock({
  width,
  height,
  rounded = 8,
}: {
  width: number | `${number}%`;
  height: number;
  rounded?: number;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View className="bg-gray-200 dark:bg-gray-700" style={{ width, height, borderRadius: rounded, opacity }} />
  );
}

// Skeleton for Hero Card area
function HeroSkeleton() {
  return (
    <View className="rounded-[20px] bg-gray-100 p-5 dark:bg-gray-800" style={{ minHeight: 200 }}>
      <SkeletonBlock width={80} height={24} rounded={12} />
      <View className="mt-4">
        <SkeletonBlock width={160} height={16} />
      </View>
      <View className="mt-2">
        <SkeletonBlock width={200} height={28} rounded={6} />
      </View>
      <View className="mt-5 flex-row gap-4">
        <View>
          <SkeletonBlock width={60} height={12} />
          <View className="mt-1">
            <SkeletonBlock width={90} height={16} />
          </View>
        </View>
        <View>
          <SkeletonBlock width={60} height={12} />
          <View className="mt-1">
            <SkeletonBlock width={90} height={16} />
          </View>
        </View>
      </View>
      <View className="mt-5">
        <SkeletonBlock width="100%" height={48} rounded={16} />
      </View>
    </View>
  );
}

// Skeleton for Primary Action Card
function PrimaryActionCardSkeleton() {
  return (
    <View
      className="flex-1 rounded-2xl bg-white p-4 dark:bg-gray-900"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }}
    >
      <SkeletonBlock width={40} height={40} rounded={12} />
      <View className="mt-3">
        <SkeletonBlock width={64} height={14} />
      </View>
      <View className="mt-1">
        <SkeletonBlock width={88} height={12} />
      </View>
    </View>
  );
}

export default function HomeIndex() {
  const { theme } = useContext(ThemeContext);
  const router = useRouter();

  const { today, isLoading, reloadToday } = useTodayAttendance();
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
  const isWeekend = WEEKEND_DAYS.includes(dayjs().day());

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Page Header */}
      <Reanimated.View entering={enterPage(0)} className="flex-row items-center justify-between px-4 pb-1">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {dayjs().format('YYYY.M.D')} · {getDaysOfWeek(dayjs().day())}
          </Text>
          <Text className="mt-1 text-[28px] font-bold leading-none text-gray-900 dark:text-white">오늘</Text>
        </View>
        <AnimatedPressable
          className="size-10 items-center justify-center rounded-full bg-white dark:bg-gray-800"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
          onPress={() => router.push('./notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color={theme === 'light' ? '#1C1C1E' : '#FFFFFF'} />
          {notifications.some((n) => !n.isRead) && (
            <View className="absolute right-0 top-0 size-2.5 rounded-full bg-red-500" />
          )}
        </AnimatedPressable>
      </Reanimated.View>

      {/* Hero Card */}
      <Reanimated.View entering={enterHero(80)} className="mt-5 px-4">
        {isLoading && !today ? (
          <HeroSkeleton />
        ) : isWeekend && workState === 'before' ? (
          <HeroWeekend />
        ) : (
          <>
            {workState === 'before' && <HeroBeforeWork today={today} />}
            {workState === 'working' && <HeroWorking today={today} remainingTime={remainingTime} />}
            {workState === 'overtime' && <HeroOvertime today={today} remainingTime={remainingTime} />}
            {workState === 'done' && <HeroDone today={today} />}
          </>
        )}
      </Reanimated.View>

      {/* Primary actions — 자주 쓰는 휴가 바로가기 2개 */}
      <Reanimated.View entering={enterPage(180)} className="mt-8 px-4">
        <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          휴가
        </Text>
        <View className="flex-row gap-3">
          {isLoading && !today ? (
            <>
              <PrimaryActionCardSkeleton />
              <PrimaryActionCardSkeleton />
            </>
          ) : (
            <>
              <PrimaryActionCard
                icon={<MaterialCommunityIcons name="calendar-plus" size={20} color="#1A7A3A" />}
                iconBg="#E8F8F0"
                label="휴가 신청"
                sub="연차·반차 신청"
                onPress={() => router.push('./dayoff/add')}
              />
              <PrimaryActionCard
                icon={<MaterialCommunityIcons name="file-document-outline" size={20} color="#7A00B0" />}
                iconBg="#FEE8FF"
                label="휴가 내역"
                sub="사용·잔여 내역"
                onPress={() => router.push('./dayoff/histories')}
              />
            </>
          )}
        </View>
      </Reanimated.View>

      {/* Secondary actions — 덜 자주 쓰는 건 리스트로 (리듬 변화) */}
      <Reanimated.View entering={enterPage(260)} className="mt-6 px-4">
        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          바로가기
        </Text>
        <View
          className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
          }}
        >
          <SecondaryActionRow
            icon={<MaterialCommunityIcons name="clock-outline" size={18} color="#0048B0" />}
            iconBg="#E5F0FF"
            label="근무 확인"
            sub="이번 달 현황"
          />
          <View className="ml-[60px] border-b border-gray-100 dark:border-gray-800" />
          <SecondaryActionRow
            icon={<MaterialIcons name="person-outline" size={18} color="#48484A" />}
            iconBg="#F2F2F7"
            label="내 정보"
            sub="프로필·설정"
          />
        </View>
      </Reanimated.View>
    </ScrollView>
  );
}

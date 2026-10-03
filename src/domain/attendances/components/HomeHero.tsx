import { useEffect } from 'react';

import { Text, View, useColorScheme } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';

import { OVERTIME_GRACE_MINUTES, type WorkState } from '@/domain/attendances/workState';
import dayjs from '@/shared/dayjs';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDuration, parseTimeFormat } from '@/utils/parse';
import { TimeCode } from '@/utils/timecode/TimeCode';

const ONE_HOUR = 3_600;
const TABULAR = { fontVariant: ['tabular-nums' as const] };
const EASE_OUT_QUART = Easing.bezier(0.25, 1, 0.5, 1);

export type RemainingTime = { isOvertime: boolean; time: TimeCode | false };

function formatClock(time: TimeCode | false) {
  return time ? `${time.formatHours.padStart(2, '0')}:${time.formatMinutes.padStart(2, '0')}` : '--:--';
}

// 퍼플 Hero 배경: 라이트는 brand, 다크는 brand-deep 그라데이션.
function HeroSurface({ children }: { children: React.ReactNode }) {
  const isDark = useColorScheme() === 'dark';

  return (
    <LinearGradient
      colors={isDark ? ['#5b1ecf', '#3b1690'] : ['#7132f5', '#6127e6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 20 }}
    >
      {children}
    </LinearGradient>
  );
}

function HeroPill({
  label,
  tone = 'default',
  pulse = false,
}: {
  label: string;
  tone?: 'default' | 'danger';
  pulse?: boolean;
}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse) return;
    opacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse, opacity]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-lg px-2 py-1 ${tone === 'danger' ? 'bg-danger' : 'bg-white/20'}`}
    >
      <Reanimated.View className="size-1.5 rounded-full bg-white" style={dotStyle} />
      <Text className="text-[11px] font-bold text-white">{label}</Text>
    </View>
  );
}

function HeroBar({ progress, tone = 'default' }: { progress: number; tone?: 'default' | 'danger' }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(progress, 0), 100), { duration: 600, easing: EASE_OUT_QUART });
  }, [progress, width]);

  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View className="h-1.5 overflow-hidden rounded-full bg-white/25">
      <Reanimated.View
        className={`h-full rounded-full ${tone === 'danger' ? 'bg-danger-dark' : 'bg-white'}`}
        style={style}
      />
    </View>
  );
}

function MetaRow({ left, right }: { left: string; right: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-xs text-white/75" style={TABULAR}>
        {left}
      </Text>
      <Text className="text-xs text-white/75" style={TABULAR}>
        {right}
      </Text>
    </View>
  );
}

function BigNumber({ children }: { children: string }) {
  return (
    <Text className="mt-3 mb-1 text-[46px] leading-none font-bold tracking-tighter text-white" style={TABULAR}>
      {children}
    </Text>
  );
}

function HeroBeforeWork({ today }: { today?: AttendanceRecord }) {
  const targetLeave = today?.leaveWorkAt ? dayjs(today.leaveWorkAt).format('HH:mm') : '18:00';

  return (
    <HeroSurface>
      <HeroPill label="출근 전" />
      <Text className="mt-4 text-sm text-white/75">아직 출근 전이에요</Text>
      <Text className="mt-1 text-[28px] font-bold tracking-tight text-white">오늘도 화이팅!</Text>
      <View className="mt-4">
        <MetaRow left="예정 출근 09:00" right={`목표 퇴근 ${targetLeave}`} />
      </View>
    </HeroSurface>
  );
}

function HeroWeekend() {
  return (
    <HeroSurface>
      <HeroPill label="주말" />
      <Text className="mt-4 text-sm text-white/75">오늘은 주말이에요</Text>
      <Text className="mt-1 text-[28px] font-bold tracking-tight text-white">푹 쉬세요</Text>
      <Text className="mt-4 text-[13px] text-white/75">출근이 필요하면 아래 버튼을 눌러주세요</Text>
    </HeroSurface>
  );
}

function HeroWorking({ today, remainingTime }: { today?: AttendanceRecord; remainingTime: RemainingTime }) {
  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const leaveWorkAt = today?.leaveWorkAt ? dayjs(today.leaveWorkAt) : null;

  // remainingTime 이 1초마다 갱신되며 이 컴포넌트를 다시 그리므로 progress 도 매번 계산한다.
  const total = clockInTime && leaveWorkAt ? leaveWorkAt.unix() - clockInTime.unix() : 0;
  const progress = clockInTime && total > 0 ? ((dayjs().unix() - clockInTime.unix()) / total) * 100 : 0;

  return (
    <HeroSurface>
      <HeroPill label={`근무중 · ${clockInTime?.format('HH:mm') ?? '--:--'} 출근`} pulse />
      <BigNumber>{formatClock(remainingTime.time)}</BigNumber>
      <MetaRow left="남은 근무시간" right={`${leaveWorkAt?.format('HH:mm') ?? '--:--'} 퇴근 예정`} />
      <View className="mt-4">
        <HeroBar progress={progress} />
      </View>
      <Text className="mt-2 text-right text-xs text-white/75" style={TABULAR}>
        {Math.round(Math.min(Math.max(progress, 0), 100))}% 완료
      </Text>
    </HeroSurface>
  );
}

function HeroOvertime({ today, remainingTime }: { today?: AttendanceRecord; remainingTime: RemainingTime }) {
  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const leaveWorkAt = today?.leaveWorkAt ? dayjs(today.leaveWorkAt) : null;

  return (
    <HeroSurface>
      <HeroPill label="초과근무" tone="danger" />
      <BigNumber>{`+${formatClock(remainingTime.time)}`}</BigNumber>
      <MetaRow
        left={`${leaveWorkAt?.format('HH:mm') ?? '--:--'} 이후 초과`}
        right={`${clockInTime?.format('HH:mm') ?? '--:--'} 출근`}
      />
      <View className="mt-4">
        <HeroBar progress={100} tone="danger" />
      </View>
    </HeroSurface>
  );
}

function HeroDone({ today }: { today?: AttendanceRecord }) {
  const clockInTime = today?.clockInTime ? dayjs(today.clockInTime) : null;
  const clockOutTime = today?.clockOutTime ? dayjs(today.clockOutTime) : null;
  const leaveWorkAt = today?.leaveWorkAt ? dayjs(today.leaveWorkAt) : null;

  const isOvertime = !!(
    clockOutTime &&
    leaveWorkAt &&
    clockOutTime.unix() > leaveWorkAt.add(OVERTIME_GRACE_MINUTES, 'minute').unix()
  );
  const overtime =
    clockOutTime && leaveWorkAt && isOvertime ? new TimeCode(clockOutTime.unix() - leaveWorkAt.unix()) : null;

  // 8시간 초과이거나 12시를 포함하면 점심시간 1시간을 제외한다 (기존 계산 그대로).
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
    <HeroSurface>
      <HeroPill label={isOvertime ? '초과 퇴근' : '퇴근 완료'} tone={isOvertime ? 'danger' : 'default'} />
      <View className="mt-3 mb-3 flex-row items-baseline gap-3">
        <Text className="text-4xl font-bold tracking-tight text-white" style={TABULAR}>
          {clockInTime?.format('HH:mm')}
        </Text>
        <Text className="text-[16px] text-white/75">→</Text>
        <Text className="text-4xl font-bold tracking-tight text-white" style={TABULAR}>
          {clockOutTime?.format('HH:mm')}
        </Text>
      </View>
      <MetaRow left={`총 근무 ${durationText}`} right={overtime ? `+${formatClock(overtime)} 초과` : ''} />
    </HeroSurface>
  );
}

export function HomeHero({
  today,
  isLoading,
  workState,
  isWeekend,
  remainingTime,
}: {
  today?: AttendanceRecord;
  isLoading: boolean;
  workState: WorkState;
  isWeekend: boolean;
  remainingTime: RemainingTime;
}) {
  if (isLoading && !today) {
    return (
      <View
        className="bg-elevated dark:bg-elevated-dark h-44 rounded-2xl"
        accessibilityLabel="오늘 근무 정보를 불러오는 중"
      />
    );
  }

  if (isWeekend && workState === 'before') {
    return <HeroWeekend />;
  }

  switch (workState) {
    case 'before':
      return <HeroBeforeWork today={today} />;
    case 'working':
      return <HeroWorking today={today} remainingTime={remainingTime} />;
    case 'overtime':
      return <HeroOvertime today={today} remainingTime={remainingTime} />;
    case 'done':
      return <HeroDone today={today} />;
  }
}

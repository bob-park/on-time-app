import { useCallback, useContext, useEffect, useState } from 'react';

import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import { HomeHero, type RemainingTime } from '@/domain/attendances/components/HomeHero';
import { syncWorkActivity, updateWorkActivity } from '@/domain/attendances/liveActivity';
import { useTodayAttendance } from '@/domain/attendances/queries/attendanceRecord';
import { OVERTIME_GRACE_MINUTES, getHomeCta, getWorkState } from '@/domain/attendances/workState';
import { useVacations } from '@/domain/documents/queries/vacations';
import { useNotificationHistories } from '@/domain/notification/queries/userNotification';
import { useUserLeaveEntry } from '@/domain/users/queries/users';
import { Icon } from '@/shared/components/Icon';
import { enterHero, enterPage } from '@/shared/components/motion/entering';
import { Button, QuickAction, usePalette } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { TimeCode } from '@/utils/timecode/TimeCode';

const WEEKEND_DAYS = [0, 6];

export default function HomeIndex() {
  // context
  const { userinfo } = useContext(AuthContext);

  // hooks
  const router = useRouter();
  const palette = usePalette();

  // queries
  const { today, isLoading, reloadToday } = useTodayAttendance();
  const { leaveEntry } = useUserLeaveEntry({ uniqueId: userinfo?.sub, year: dayjs().year() });
  // 휴가 내역 화면과 같은 파라미터 → 같은 query cache 를 공유한다.
  const { vacations } = useVacations({
    userUniqueId: userinfo?.sub,
    startDateFrom: dayjs().startOf('year').toDate(),
    endDateFrom: dayjs().endOf('year').toDate(),
    status: 'APPROVED',
    page: 0,
    size: 1000,
  });
  // ponytail: 첫 페이지(25건) 기준 미읽음 수. 정확한 수가 필요하면 서버 count API 추가.
  const { pages } = useNotificationHistories({ page: 0, size: 25 });
  const unreadCount = pages.reduce((count, page) => count + page.content.filter((n) => !n.isRead).length, 0);

  // state
  const [refreshing, setRefreshing] = useState(false);
  const [remainingTime, setRemainingTime] = useState<RemainingTime>({ isOvertime: false, time: false });

  // useEffect
  useEffect(() => {
    const calculate = () => {
      if (!today?.leaveWorkAt) {
        setRemainingTime({ isOvertime: false, time: false });
        return;
      }

      // 남은 시간(양수) = 목표까지, 음수 = 목표 초과. 초과근무는 30분 유예 후 진입.
      const remainingSec = dayjs(today.leaveWorkAt).unix() - dayjs().unix();
      const isOvertime = -remainingSec > OVERTIME_GRACE_MINUTES * 60;

      // 초과근무면 목표 대비 초과분을, 그 외에는 목표까지 남은 시간을 0에서 클램프한다.
      setRemainingTime({ isOvertime, time: new TimeCode(isOvertime ? -remainingSec : Math.max(0, remainingSec)) });
    };

    calculate();
    const intervalId = setInterval(calculate, 1_000);
    return () => clearInterval(intervalId);
  }, [today]);

  // 부팅/오늘 기록 변경 시 iOS Live Activity 상태를 동기화 (iOS 외 no-op)
  useEffect(() => {
    syncWorkActivity(today).catch((err) => console.error('[LiveActivity] sync failed', err));
  }, [today]);

  // 근무 중일 때만 앱 포그라운드에서 분 단위로 Live Activity 라벨을 갱신한다. (iOS 외 no-op)
  useEffect(() => {
    const isWorking = !!today?.clockInTime && !today?.clockOutTime;
    if (!isWorking) return;

    const clockInAt = dayjs(today.clockInTime).toISOString();
    const targetLeaveAt = today.leaveWorkAt
      ? dayjs(today.leaveWorkAt).toISOString()
      : dayjs(today.clockInTime).add(8, 'hour').toISOString();

    const intervalId = setInterval(() => {
      updateWorkActivity({ clockInAt, targetLeaveAt }).catch((err) =>
        console.error('[LiveActivity] minute refresh failed', err),
      );
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [today]);

  // handle
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reloadToday();
    setRefreshing(false);
  }, [reloadToday]);

  const workState = getWorkState(today);
  const isWeekend = WEEKEND_DAYS.includes(dayjs().day());
  const cta = getHomeCta(workState, isLoading && !today);

  const leaveSub = leaveEntry ? `연차 ${leaveEntry.totalLeaveDays - leaveEntry.usedLeaveDays}일` : '연차 -';
  const compSub = leaveEntry ? `${leaveEntry.totalCompLeaveDays - leaveEntry.usedCompLeaveDays}일 사용 가능` : '-';

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.muted} />}
      >
        {/* header */}
        <Reanimated.View entering={enterPage(0)}>
          <Text className="text-muted dark:text-muted-dark text-xs font-semibold">
            {dayjs().format('M월 D일 dddd')}
          </Text>
          <Text className="text-content dark:text-content-dark mt-0.5 text-[28px] font-bold tracking-tight">오늘</Text>
        </Reanimated.View>

        {/* hero */}
        <Reanimated.View entering={enterHero(80)} className="mt-4">
          <HomeHero
            today={today}
            isLoading={isLoading}
            workState={workState}
            isWeekend={isWeekend}
            remainingTime={remainingTime}
          />
        </Reanimated.View>

        {/* quick actions */}
        <Reanimated.View entering={enterPage(160)} className="mt-6">
          <Text className="text-muted dark:text-muted-dark mb-2 text-[11px] font-semibold tracking-wider">
            빠른 실행
          </Text>
          <View className="flex-row gap-3">
            <QuickAction
              icon={<Icon sf="airplane" fallback="✈" size={17} color={palette.brand} />}
              label="휴가 신청"
              sub={leaveSub}
              onPress={() => router.push('./dayoff/add')}
            />
            <QuickAction
              icon={<Icon sf="gift" fallback="🎁" size={17} color={palette.brand} />}
              label="보상휴가"
              sub={compSub}
              onPress={() => router.push({ pathname: '/(tabs)/(home)/dayoff/add', params: { type: 'COMPENSATORY' } })}
            />
          </View>
          <View className="mt-3 flex-row gap-3">
            <QuickAction
              icon={<Icon sf="list.bullet.rectangle" fallback="☰" size={17} color={palette.brand} />}
              label="휴가 내역"
              sub={`올해 ${vacations.length}건`}
              onPress={() => router.push('./dayoff/histories')}
            />
            <QuickAction
              icon={<Icon sf="bell" fallback="🔔" size={17} color={palette.brand} />}
              label="알림"
              sub={unreadCount > 0 ? `읽지 않음 ${unreadCount}개` : '새 알림 없음'}
              onPress={() => router.push('./notifications')}
            />
          </View>
        </Reanimated.View>
      </ScrollView>

      {/* 하단 고정 CTA — 탭바 위 엄지 영역 */}
      {cta && (
        <View className="pt-3 pb-28">
          <Button label={cta} onPress={() => router.push('./attendance')} />
        </View>
      )}
    </View>
  );
}

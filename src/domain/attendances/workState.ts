import dayjs from '@/shared/dayjs';

// '초과근무' 상태는 목표 퇴근시각을 지난 즉시가 아니라 30분을 초과한 시점부터 진입한다.
export const OVERTIME_GRACE_MINUTES = 30;

export type WorkState = 'before' | 'working' | 'overtime' | 'done';

export function getWorkState(today?: AttendanceRecord, now: Date = new Date()): WorkState {
  if (!today?.clockInTime) return 'before';
  if (today.clockOutTime) return 'done';
  if (today.leaveWorkAt && dayjs(now).isAfter(dayjs(today.leaveWorkAt).add(OVERTIME_GRACE_MINUTES, 'minute'))) {
    return 'overtime';
  }
  return 'working';
}

// 홈 하단 고정 버튼 문구. null 이면 버튼을 숨긴다.
export function getHomeCta(workState: WorkState, isLoading: boolean): '출근하기' | '퇴근하기' | null {
  if (isLoading) return null;
  if (workState === 'before') return '출근하기';
  if (workState === 'done') return null;
  return '퇴근하기';
}

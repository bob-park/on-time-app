type WorkActivityInput = { clockInAt: string; targetLeaveAt: string };
type SyncDecision = { action: 'start'; input: WorkActivityInput } | { action: 'end' } | { action: 'none' };

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export function decideActivitySync(today: AttendanceRecord | undefined, hasActiveActivity: boolean): SyncDecision {
  const isWorking = !!today?.clockInTime && !today?.clockOutTime;

  if (isWorking) {
    if (hasActiveActivity) return { action: 'none' };
    const clockInAt = new Date(today!.clockInTime!).toISOString();
    const targetLeaveAt = today!.leaveWorkAt
      ? new Date(today!.leaveWorkAt).toISOString()
      : new Date(new Date(today!.clockInTime!).getTime() + EIGHT_HOURS_MS).toISOString();
    return { action: 'start', input: { clockInAt, targetLeaveAt } };
  }

  return hasActiveActivity ? { action: 'end' } : { action: 'none' };
}

export type { WorkActivityInput, SyncDecision };

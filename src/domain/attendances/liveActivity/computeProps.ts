import type { WorkActivityInput } from '@/domain/attendances/liveActivitySync';

import type { WorkActivityProps } from './types';

// ────────────────────────────────────────────────────────────────────────────
// computeWorkActivityProps — pure, deterministic mapping from a work session
// (clock-in + target leave) at a given `now` into the flat, serializable props
// consumed by the WorkLiveActivity 'widget'. `now` is a parameter so the logic
// is fully unit-testable without mocking the clock.
// ────────────────────────────────────────────────────────────────────────────

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

// Format a millisecond duration as "H:MM" (hours are not zero-padded and may
// exceed 9; minutes are always two digits). Negative inputs are treated as 0.
function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.max(ms, 0) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

export function computeWorkActivityProps(input: WorkActivityInput, now: Date): WorkActivityProps {
  const clockInMs = new Date(input.clockInAt).getTime();
  const targetMs = new Date(input.targetLeaveAt).getTime();
  const nowMs = now.getTime();

  const elapsedMs = nowMs - clockInMs;
  const totalMs = targetMs - clockInMs;
  const isOvertime = nowMs > targetMs;

  const progress = totalMs > 0 ? clamp01(elapsedMs / totalMs) : isOvertime ? 1 : 0;
  const remainingMs = isOvertime ? nowMs - targetMs : targetMs - nowMs;

  return {
    clockInAt: input.clockInAt,
    targetLeaveAt: input.targetLeaveAt,
    progress,
    remainingLabel: formatDuration(remainingMs),
    workedLabel: formatDuration(elapsedMs),
    isOvertime,
  };
}

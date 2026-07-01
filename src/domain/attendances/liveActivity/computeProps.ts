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

// Compact duration for the Dynamic Island's tiny compact/minimal slots: when the
// duration is at least an hour we drop the minutes ("1h20m" → "1h"); under an
// hour we show whole minutes ("20m"). Keeping this short avoids the ".."
// truncation the seconds-based timer produced.
function formatCompact(ms: number): string {
  const totalMinutes = Math.floor(Math.max(ms, 0) / 60_000);
  if (totalMinutes >= 60) return `${Math.floor(totalMinutes / 60)}h`;
  return `${totalMinutes}m`;
}

// Format an instant as a local wall-clock "HH:mm". Uses local getters (not UTC)
// so the label matches the target time the user sees elsewhere in the app
// (home screen uses dayjs local `HH:mm`).
function formatClockTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function computeWorkActivityProps(input: WorkActivityInput, now: Date): WorkActivityProps {
  const clockInMs = new Date(input.clockInAt).getTime();
  const targetMs = new Date(input.targetLeaveAt).getTime();
  const nowMs = now.getTime();

  const elapsedMs = nowMs - clockInMs;
  const totalMs = targetMs - clockInMs;
  const isOvertime = nowMs > targetMs;

  const progress = totalMs > 0 ? clamp01(elapsedMs / totalMs) : isOvertime ? 1 : 0;
  // Before the target: count down remaining. In overtime: the "remaining" slot
  // instead counts UP the amount past the target, prefixed with "+"
  // (e.g. "+0:30" / compact "+30m"), mirroring the home overtime hero.
  const remainingMs = targetMs - nowMs;
  const overtimeMs = nowMs - targetMs;

  return {
    clockInAt: input.clockInAt,
    targetLeaveAt: input.targetLeaveAt,
    progress,
    remainingLabel: isOvertime ? `+${formatDuration(overtimeMs)}` : formatDuration(remainingMs),
    workedLabel: formatDuration(elapsedMs),
    remainingCompact: isOvertime ? `+${formatCompact(overtimeMs)}` : formatCompact(remainingMs),
    workedCompact: formatCompact(elapsedMs),
    targetLabel: formatClockTime(targetMs),
    isOvertime,
  };
}

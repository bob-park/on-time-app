import type { WorkActivityInput } from '@/domain/attendances/liveActivitySync';

import type { WorkActivityProps } from './types';

// ────────────────────────────────────────────────────────────────────────────
// computeWorkActivityProps — pure, deterministic mapping from a work session
// (clock-in + target leave) at a given `now` into the flat, serializable props
// consumed by the WorkLiveActivity 'widget'. `now` is a parameter so the logic
// is fully unit-testable without mocking the clock.
//
// Only the STATIC parts are computed here (compact Dynamic Island strings,
// wall-clock labels, overtime flag). The flowing time texts and the progress
// bar are system-rendered from `clockInAtMs`/`targetLeaveAtMs` inside the
// widget, so they keep updating even when the app is terminated.
// ────────────────────────────────────────────────────────────────────────────

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
// so the label matches the times the user sees elsewhere in the app
// (home screen uses dayjs local `HH:mm`).
function formatClockTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function computeWorkActivityProps(input: WorkActivityInput, now: Date): WorkActivityProps {
  const clockInMs = new Date(input.clockInAt).getTime();
  // Clamp the target to at least clock-in: if upstream data ever yields
  // targetLeaveAt <= clockInAt, the raw values would give the widget's
  // ProgressView timerInterval an inverted range, which renders as undefined.
  const targetMs = Math.max(new Date(input.targetLeaveAt).getTime(), clockInMs);
  const nowMs = now.getTime();

  const elapsedMs = nowMs - clockInMs;
  const isOvertime = nowMs > targetMs;
  // Before the target: count down remaining. In overtime: the "remaining" slot
  // instead counts UP the amount past the target, prefixed with "+"
  // (e.g. "+30m"/"+1h"). Note the Live Activity flips isOvertime at the target
  // instant itself (nowMs > targetMs, no grace), unlike the home overtime hero
  // which only enters overtime after a 30-minute grace (OVERTIME_GRACE_MINUTES).
  const remainingMs = targetMs - nowMs;
  const overtimeMs = nowMs - targetMs;

  return {
    clockInAtMs: clockInMs,
    targetLeaveAtMs: targetMs,
    remainingCompact: isOvertime ? `+${formatCompact(overtimeMs)}` : formatCompact(remainingMs),
    workedCompact: formatCompact(elapsedMs),
    clockInLabel: formatClockTime(clockInMs),
    targetLabel: formatClockTime(targetMs),
    isOvertime,
  };
}

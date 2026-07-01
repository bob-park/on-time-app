// Props passed from the app to the WorkLiveActivity 'widget' component.
// Kept flat + serializable (strings/numbers/booleans only) because Live Activity
// props are marshalled to native on every update.
export type WorkActivityProps = {
  /** ISO-8601 timestamp of clock-in. */
  clockInAt: string;
  /** ISO-8601 timestamp of the target leave-work time. */
  targetLeaveAt: string;
  /** Progress toward the target, 0..1. */
  progress: number;
  /** Remaining time until target as "H:MM" (always "0:00" while in overtime). */
  remainingLabel: string;
  /** Elapsed time since clock-in as "H:MM". */
  workedLabel: string;
  /** Compact remaining time: "1h" when ≥ 60min, otherwise "20m". */
  remainingCompact: string;
  /** Compact elapsed time: "1h" when ≥ 60min, otherwise "20m". */
  workedCompact: string;
  /** Target leave time as a local wall-clock "HH:mm" (e.g. "18:00"). */
  targetLabel: string;
  /** Whether the user is past the target leave time. */
  isOvertime: boolean;
};

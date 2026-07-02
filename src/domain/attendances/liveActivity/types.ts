// Props passed from the app to the WorkLiveActivity 'widget' component.
// Kept flat + serializable (strings/numbers/booleans only) because Live Activity
// props are marshalled to native on every update. Instants are epoch ms numbers;
// the widget revives them with `new Date(ms)` for system-rendered relative text
// and timer-driven progress.
export type WorkActivityProps = {
  /** Clock-in instant as epoch milliseconds. */
  clockInAtMs: number;
  /** Target leave-work instant as epoch milliseconds. */
  targetLeaveAtMs: number;
  /** Compact remaining time: "1h" when ≥ 60min, otherwise "20m"; "+1h"/"+30m" in overtime. */
  remainingCompact: string;
  /** Compact elapsed time: "1h" when ≥ 60min, otherwise "20m". */
  workedCompact: string;
  /** Clock-in time as a local wall-clock "HH:mm" (e.g. "09:00"). */
  clockInLabel: string;
  /** Target leave time as a local wall-clock "HH:mm" (e.g. "18:00"). */
  targetLabel: string;
  /** Whether the user is past the target leave time. */
  isOvertime: boolean;
};

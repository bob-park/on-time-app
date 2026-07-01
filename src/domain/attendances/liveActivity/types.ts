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
  /** App-formatted remaining-time label (fallback / accessibility). */
  remainingLabel: string;
  /** App-formatted worked-time label (fallback / accessibility). */
  workedLabel: string;
  /** Whether the user is past the target leave time. */
  isOvertime: boolean;
};

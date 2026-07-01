import { Platform } from 'react-native';

import type { WorkActivityInput } from '@/domain/attendances/liveActivitySync';

import LiveActivityModule from './src/LiveActivityModule';

// iOS-only guard: on non-iOS platforms (or when the native module is absent) `native`
// is `null`, so every exported function below degrades to a safe no-op / `false`.
const native = Platform.OS === 'ios' ? LiveActivityModule : null;

/**
 * Whether the OS/user currently allows Live Activities.
 * Returns `false` on non-iOS platforms or when the native module is unavailable.
 */
export function areActivitiesEnabled(): boolean {
  return !!native && native.areActivitiesEnabled();
}

/**
 * Starts the "work in progress" Live Activity.
 * @returns the activity id on success, or `null` on failure / unsupported platform.
 */
export async function startWorkActivity(input: WorkActivityInput): Promise<string | null> {
  if (!native || !areActivitiesEnabled()) return null;
  return native.startWorkActivity(input.clockInAt, input.targetLeaveAt);
}

/** Ends the active work Live Activity. No-op when unsupported. */
export async function endWorkActivity(): Promise<void> {
  if (!native) return;
  await native.endWorkActivity();
}

/** Updates the target leave time of the active work Live Activity. No-op when unsupported. */
export async function updateWorkActivity(input: { targetLeaveAt: string }): Promise<void> {
  if (!native || !areActivitiesEnabled()) return;
  await native.updateWorkActivity(input.targetLeaveAt);
}

/** Whether a work Live Activity is currently running. Returns `false` when unsupported. */
export async function hasActiveWorkActivity(): Promise<boolean> {
  if (!native) return false;
  return native.hasActiveWorkActivity();
}

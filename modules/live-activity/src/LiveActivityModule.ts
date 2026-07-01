import { requireOptionalNativeModule } from 'expo-modules-core';

// Native module interface (implemented in ios/LiveActivityModule.swift).
// The Swift layer receives primitive args, so the native signatures are flattened
// (e.g. `startWorkActivity(clockInAt, targetLeaveAt)`), not object-shaped.
export type NativeLiveActivityModule = {
  areActivitiesEnabled(): boolean;
  startWorkActivity(clockInAt: string, targetLeaveAt: string): Promise<string | null>;
  endWorkActivity(): Promise<void>;
  updateWorkActivity(targetLeaveAt: string): Promise<void>;
  hasActiveWorkActivity(): Promise<boolean>;
};

// `requireOptionalNativeModule` returns `null` (instead of throwing) when the native
// module is not present — e.g. Android, web, or before a native build has been made.
export default requireOptionalNativeModule<NativeLiveActivityModule>('LiveActivityModule');

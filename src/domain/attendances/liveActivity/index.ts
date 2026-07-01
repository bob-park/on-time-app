import { Platform } from 'react-native';

import type { LiveActivityFactory } from 'expo-widgets';

import { type WorkActivityInput, decideActivitySync } from '@/domain/attendances/liveActivitySync';

import { computeWorkActivityProps } from './computeProps';
import type { WorkActivityProps } from './types';

// ────────────────────────────────────────────────────────────────────────────
// Live Activity wrapper — the only module the app should touch to start/update/
// end the work-session Live Activity.
//
// iOS-ONLY. Every export is a safe no-op on Android/web. `WorkLiveActivity`
// calls `createLiveActivity(...)` at module load and, on iOS, that pulls in the
// native `ExpoWidgets` module + `@expo/ui/swift-ui`. To make sure none of that
// is even loaded off-iOS, the factory is imported lazily via `require` inside an
// `Platform.OS === 'ios'` guard rather than with a top-level `import`.
// ────────────────────────────────────────────────────────────────────────────

type WorkActivityFactory = LiveActivityFactory<WorkActivityProps>;

function getFactory(): WorkActivityFactory | null {
  if (Platform.OS !== 'ios') return null;

  const mod = require('./WorkLiveActivity') as { default: WorkActivityFactory };
  return mod.default;
}

export async function startWorkActivity(input: WorkActivityInput): Promise<void> {
  const factory = getFactory();
  if (!factory) return;

  const props = computeWorkActivityProps(input, new Date());
  const [active] = factory.getInstances();

  // Avoid stacking duplicate activities: update the existing one if present.
  if (active) {
    await active.update(props);
    return;
  }

  factory.start(props);
}

export async function updateWorkActivity(input: WorkActivityInput): Promise<void> {
  const factory = getFactory();
  if (!factory) return;

  const props = computeWorkActivityProps(input, new Date());
  await Promise.all(factory.getInstances().map((instance) => instance.update(props)));
}

export async function endWorkActivity(): Promise<void> {
  const factory = getFactory();
  if (!factory) return;

  await Promise.all(factory.getInstances().map((instance) => instance.end('immediate')));
}

export async function syncWorkActivity(today: AttendanceRecord | undefined): Promise<void> {
  const factory = getFactory();
  if (!factory) return;

  const decision = decideActivitySync(today, factory.getInstances().length > 0);

  if (decision.action === 'start') {
    await startWorkActivity(decision.input);
  } else if (decision.action === 'end') {
    await endWorkActivity();
  }
}

# Phase 3 — 근무시간 LiveActivity (iOS 전용) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** iOS에서 근무 시작 시 Live Activity를 시작하고 종료 시 종료한다. 잠금화면은 진행 링+스탯(L2), 다이나믹 아일랜드는 좌=남은시간/우=근무시간으로 표시하며, 시간은 네이티브 자동 타이머로 갱신한다.

**Architecture:** 커스텀 Expo config plugin이 prebuild 시 iOS Widget Extension 타깃을 생성하고 Live Activity 설정을 주입한다. Swift(ActivityKit/WidgetKit + SwiftUI)로 위젯 UI를 작성하고, 얇은 Expo 네이티브 모듈이 start/end/update를 JS로 노출한다. 앱은 `useClockIn`/`useClockOut`의 onSuccess에서 이를 호출하고, 부팅 시 attendance 상태와 Activity를 동기화한다. iOS 외 플랫폼은 no-op.

**Tech Stack:** Expo Modules API(Swift), ActivityKit, WidgetKit, SwiftUI, Expo config plugins(`expo/config-plugins`), TypeScript.

## Global Constraints

- 작업 브랜치: `feature/ui-v3-and-live-activity`. **Phase 1·2 완료 후 시작.**
- iOS 전용. Android/웹은 모든 API가 no-op이며 크래시 없어야 함.
- iOS 배포타깃 **16.2+** (Live Activity 요구). config plugin이 강제.
- 외부 Live Activity 라이브러리 추가 금지(커스텀 구현). 단, Expo Modules API/config-plugins는 사용.
- 시간 갱신은 네이티브 `Text(timerInterval:countsDown:)`로 처리(푸시 불요). 백엔드 푸시 미사용.
- secret/서명 관련 파일(`GoogleService-Info.plist` 등) 변경 금지.
- Live Activity는 Dev Client/EAS 빌드 필요(Expo Go 미지원). 검증은 `expo prebuild` + `yarn ios`.
- 색: 잠금화면/다이나믹 아일랜드 액센트 그린 `#1ed760`, 배경 블랙.
- 트리거 데이터: `clockInAt`(출근 시각), `targetLeaveAt`(목표 퇴근 = `leaveWorkAt`). 둘 다 ISO 문자열로 JS↔네이티브 전달.
- 각 태스크 종료 시 커밋.

## 모듈 디렉토리

`src/modules/live-activity/` (로컬 Expo 모듈)
- `expo-module.config.json`, `index.ts`(JS API), `src/LiveActivityModule.ts`(네이티브 인터페이스), `ios/`(Swift), `plugin/`(config plugin)
앱 연동: `src/domain/attendances/liveActivity.ts`(래퍼 + 동기화 순수 로직).

---

### Task 1: 동기화 순수 로직 (TDD — 플랫폼 독립)

**Files:**
- Create: `src/domain/attendances/liveActivitySync.ts`
- Test: `src/domain/attendances/liveActivitySync.test.ts`

**Interfaces:**
- Produces:
  - `type WorkActivityInput = { clockInAt: string; targetLeaveAt: string }`
  - `type SyncDecision = { action: 'start'; input: WorkActivityInput } | { action: 'end' } | { action: 'none' }`
  - `decideActivitySync(today: AttendanceRecord | undefined, hasActiveActivity: boolean): SyncDecision`
- Consumes: `AttendanceRecord`(기존 `src/domain/attendances/types/types.d.ts`).

근무 중 판정: `clockInTime` 있고 `clockOutTime` 없음 = 근무 중. 근무 중인데 Activity 없으면 start, 근무 아님인데 Activity 있으면 end, 그 외 none.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/domain/attendances/liveActivitySync.test.ts`:
```typescript
import { decideActivitySync } from './liveActivitySync';

const base = { id: 1, userUniqueId: 'u', workType: 'OFFICE', status: 'SUCCESS', workingDate: new Date(), createdDate: new Date(), createdBy: 'u' } as any;

describe('decideActivitySync', () => {
  it('근무 중이고 Activity 없으면 start', () => {
    const today = { ...base, clockInTime: new Date('2026-06-30T09:00:00Z'), leaveWorkAt: new Date('2026-06-30T18:00:00Z') };
    expect(decideActivitySync(today, false)).toEqual({
      action: 'start',
      input: { clockInAt: '2026-06-30T09:00:00.000Z', targetLeaveAt: '2026-06-30T18:00:00.000Z' },
    });
  });

  it('근무 중이고 Activity 있으면 none', () => {
    const today = { ...base, clockInTime: new Date('2026-06-30T09:00:00Z'), leaveWorkAt: new Date('2026-06-30T18:00:00Z') };
    expect(decideActivitySync(today, true)).toEqual({ action: 'none' });
  });

  it('퇴근했는데 Activity 있으면 end', () => {
    const today = { ...base, clockInTime: new Date('2026-06-30T09:00:00Z'), clockOutTime: new Date('2026-06-30T18:00:00Z') };
    expect(decideActivitySync(today, true)).toEqual({ action: 'end' });
  });

  it('출근 전이면 none', () => {
    expect(decideActivitySync(undefined, false)).toEqual({ action: 'none' });
  });

  it('출근 전인데 Activity 있으면 end', () => {
    expect(decideActivitySync(undefined, true)).toEqual({ action: 'end' });
  });

  it('근무 중이나 targetLeaveAt 없으면 clockInAt 기준 8시간 후로 start', () => {
    const today = { ...base, clockInTime: new Date('2026-06-30T09:00:00Z') };
    expect(decideActivitySync(today, false)).toEqual({
      action: 'start',
      input: { clockInAt: '2026-06-30T09:00:00.000Z', targetLeaveAt: '2026-06-30T17:00:00.000Z' },
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `yarn jest src/domain/attendances/liveActivitySync.test.ts`
Expected: FAIL — `decideActivitySync` 미정의.
(주의: `package.json`의 test 스크립트가 `jest --watchAll`이므로 단발 실행은 `yarn jest <file>` 사용.)

- [ ] **Step 3: 최소 구현**

Create `src/domain/attendances/liveActivitySync.ts`:
```typescript
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `yarn jest src/domain/attendances/liveActivitySync.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/domain/attendances/liveActivitySync.ts src/domain/attendances/liveActivitySync.test.ts
git commit -m "feat: Live Activity 동기화 결정 순수 로직 추가(TDD)"
```

---

### Task 2: 로컬 Expo 네이티브 모듈 스캐폴딩 + JS API

**Files:**
- Create: `src/modules/live-activity/expo-module.config.json`
- Create: `src/modules/live-activity/index.ts`
- Create: `src/modules/live-activity/src/LiveActivityModule.ts`
- Create: `src/modules/live-activity/ios/LiveActivityModule.swift`
- Modify: `package.json` (로컬 모듈 autolinking 인식 — `expo` 모듈 검색 경로)

**Interfaces:**
- Consumes: `WorkActivityInput`(Task 1).
- Produces (JS API from `@/modules/live-activity` 또는 상대 경로):
  - `areActivitiesEnabled(): boolean`
  - `startWorkActivity(input: WorkActivityInput): Promise<string | null>` (activityId 반환, 실패 시 null)
  - `endWorkActivity(): Promise<void>`
  - `updateWorkActivity(input: { targetLeaveAt: string }): Promise<void>`
  - `hasActiveWorkActivity(): Promise<boolean>`
  - 모든 함수는 iOS 외에서 안전한 no-op/false 반환.

- [ ] **Step 1: expo 모듈 설정**

Create `src/modules/live-activity/expo-module.config.json`:
```json
{ "platforms": ["ios"], "ios": { "modules": ["LiveActivityModule"] } }
```

- [ ] **Step 2: 네이티브 인터페이스 선언 (JS)**

Create `src/modules/live-activity/src/LiveActivityModule.ts`:
```typescript
import { requireNativeModule } from 'expo-modules-core';

export type NativeLiveActivityModule = {
  areActivitiesEnabled(): boolean;
  startWorkActivity(clockInAt: string, targetLeaveAt: string): Promise<string | null>;
  endWorkActivity(): Promise<void>;
  updateWorkActivity(targetLeaveAt: string): Promise<void>;
  hasActiveWorkActivity(): Promise<boolean>;
};

export default requireNativeModule<NativeLiveActivityModule>('LiveActivityModule');
```

- [ ] **Step 3: 플랫폼 가드 JS API**

Create `src/modules/live-activity/index.ts`:
```typescript
import { Platform } from 'react-native';

import type { WorkActivityInput } from '@/domain/attendances/liveActivitySync';

let native: import('./src/LiveActivityModule').NativeLiveActivityModule | null = null;
if (Platform.OS === 'ios') {
  try {
    native = require('./src/LiveActivityModule').default;
  } catch {
    native = null;
  }
}

export function areActivitiesEnabled(): boolean {
  return Platform.OS === 'ios' && !!native && native.areActivitiesEnabled();
}

export async function startWorkActivity(input: WorkActivityInput): Promise<string | null> {
  if (!areActivitiesEnabled() || !native) return null;
  return native.startWorkActivity(input.clockInAt, input.targetLeaveAt);
}

export async function endWorkActivity(): Promise<void> {
  if (Platform.OS !== 'ios' || !native) return;
  await native.endWorkActivity();
}

export async function updateWorkActivity(targetLeaveAt: string): Promise<void> {
  if (!areActivitiesEnabled() || !native) return;
  await native.updateWorkActivity(targetLeaveAt);
}

export async function hasActiveWorkActivity(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !native) return false;
  return native.hasActiveWorkActivity();
}
```

- [ ] **Step 4: Swift 모듈 뼈대 (ActivityKit 미연결, 컴파일만)**

Create `src/modules/live-activity/ios/LiveActivityModule.swift`:
```swift
import ExpoModulesCore
import ActivityKit

public class LiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LiveActivityModule")

    Function("areActivitiesEnabled") { () -> Bool in
      if #available(iOS 16.2, *) { return ActivityAuthorizationInfo().areActivitiesEnabled }
      return false
    }

    AsyncFunction("startWorkActivity") { (clockInAt: String, targetLeaveAt: String) -> String? in
      return nil // Task 4에서 구현
    }
    AsyncFunction("endWorkActivity") { () in }
    AsyncFunction("updateWorkActivity") { (targetLeaveAt: String) in }
    AsyncFunction("hasActiveWorkActivity") { () -> Bool in return false }
  }
}
```

- [ ] **Step 5: 모듈 인식 확인**

Run(사용자): `! npx expo prebuild --clean -p ios && yarn ios`
Expected: 로컬 모듈이 autolink되어 빌드 성공. JS에서 `areActivitiesEnabled()` 호출 시 크래시 없음.
(주의: 로컬 모듈이 인식되지 않으면 `package.json`에 모듈 경로를 추가하거나 `npx create-expo-module --local`로 생성한 구조를 따른다.)

- [ ] **Step 6: 커밋**

```bash
git add src/modules/live-activity package.json
git commit -m "feat: Live Activity 로컬 Expo 모듈 스캐폴딩 및 플랫폼 가드 JS API"
```

---

### Task 3: Config plugin — Widget Extension 타깃 + Info.plist

**Files:**
- Create: `src/modules/live-activity/plugin/withLiveActivity.js`
- Create: `src/modules/live-activity/ios/widget/OnTimeWidgetBundle.swift`
- Create: `src/modules/live-activity/ios/widget/WorkActivityAttributes.swift`
- Create: `src/modules/live-activity/ios/widget/Info.plist`
- Modify: `app.json` (plugins 배열에 plugin 추가, ios deploymentTarget/infoPlist)

**Interfaces:**
- Produces: prebuild 시 `OnTimeWidget` Widget Extension 타깃 생성 + `NSSupportsLiveActivities=true` + 배포타깃 16.2.

- [ ] **Step 1: ActivityAttributes 정의 (공유 Swift)**

Create `src/modules/live-activity/ios/widget/WorkActivityAttributes.swift`:
```swift
import ActivityKit
import Foundation

public struct WorkActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var progress: Double
  }
  public var clockInAt: Date
  public var targetLeaveAt: Date
}
```
(이 파일은 모듈과 위젯 익스텐션 양쪽 타깃에 포함되어야 함 — plugin이 두 타깃 membership 설정.)

- [ ] **Step 2: config plugin 작성**

Create `src/modules/live-activity/plugin/withLiveActivity.js`:
- `withInfoPlist`로 `NSSupportsLiveActivities = true` 추가.
- `withXcodeProject`로 `OnTimeWidget` Widget Extension 타깃 추가, Swift 파일(`OnTimeWidgetBundle.swift`, `WorkActivityAttributes.swift`) 및 `Info.plist` 등록, 배포타깃 16.2.
- App Group(`group.com.bobpark.ontimeapp`) 추가(모듈↔위젯 공유 필요 시).
구조:
```javascript
const { withInfoPlist, withXcodeProject, createRunOncePlugin } = require('expo/config-plugins');

const withLiveActivity = (config) => {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.NSSupportsLiveActivities = true;
    return cfg;
  });
  config = withXcodeProject(config, (cfg) => {
    // OnTimeWidget extension 타깃 생성 + 파일 등록 + deploymentTarget 16.2
    return cfg;
  });
  return config;
};

module.exports = createRunOncePlugin(withLiveActivity, 'withLiveActivity', '1.0.0');
```
(Xcode 타깃 생성은 `@bacons/xcode` 또는 expo의 `IOSConfig` 헬퍼 사용; 위젯 익스텐션 추가 로직을 명시적으로 작성.)

- [ ] **Step 3: 위젯 번들 뼈대**

Create `src/modules/live-activity/ios/widget/OnTimeWidgetBundle.swift`:
```swift
import WidgetKit
import SwiftUI

@main
struct OnTimeWidgetBundle: WidgetBundle {
  var body: some Widget {
    WorkLiveActivityWidget() // Task 4에서 정의
  }
}
```
Create `src/modules/live-activity/ios/widget/Info.plist` — Widget Extension용 표준 plist(`NSExtensionPointIdentifier = com.apple.widgetkit-extension`).

- [ ] **Step 4: app.json 등록**

`app.json` plugins 배열에 `"./src/modules/live-activity/plugin/withLiveActivity"` 추가. `ios.infoPlist.NSSupportsLiveActivities=true`, `ios.deploymentTarget`/build-properties 16.2 설정(expo-build-properties 사용 중이므로 거기 `ios.deploymentTarget: "16.2"`).

- [ ] **Step 5: prebuild 검증**

Run(사용자): `! npx expo prebuild --clean -p ios`
Expected: `ios/` 에 `OnTimeWidget` 타깃 생성, Info.plist에 `NSSupportsLiveActivities`. Xcode 프로젝트 열어 타깃 확인 가능.

- [ ] **Step 6: 커밋**

```bash
git add src/modules/live-activity/plugin src/modules/live-activity/ios/widget app.json
git commit -m "feat: Live Activity config plugin 및 Widget Extension 타깃 생성"
```

---

### Task 4: 위젯 UI (SwiftUI) — 잠금화면 L2 + 다이나믹 아일랜드

**Files:**
- Create: `src/modules/live-activity/ios/widget/WorkLiveActivityWidget.swift`

**Interfaces:**
- Consumes: `WorkActivityAttributes`(Task 3).
- Produces: 잠금화면(L2 진행 링+스탯) + 다이나믹 아일랜드(compact/minimal/expanded).

- [ ] **Step 1: 잠금화면 + DI 뷰 작성**

Create `src/modules/live-activity/ios/widget/WorkLiveActivityWidget.swift`:
```swift
import ActivityKit
import WidgetKit
import SwiftUI

@available(iOS 16.2, *)
struct WorkLiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: WorkActivityAttributes.self) { context in
      // 잠금화면 (L2): 진행 링 + 남은시간 큰 숫자 + 근무/목표
      LockScreenView(context: context)
        .activityBackgroundTint(Color.black)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          VStack(alignment: .leading) {
            Text("남은 시간").font(.caption2).foregroundStyle(.secondary)
            Text(timerInterval: Date()...context.attributes.targetLeaveAt, countsDown: true)
              .font(.system(size: 34, weight: .bold)).foregroundStyle(Color(hex: 0x1ED760)).monospacedDigit()
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          VStack(alignment: .trailing) {
            Text("근무 시간").font(.caption2).foregroundStyle(.secondary)
            Text(timerInterval: context.attributes.clockInAt...Date.distantFuture, countsDown: false)
              .font(.system(size: 22, weight: .bold)).monospacedDigit()
          }
        }
        DynamicIslandExpandedRegion(.bottom) {
          ProgressView(value: context.state.progress).tint(Color(hex: 0x1ED760))
        }
      } compactLeading: {
        Text(timerInterval: Date()...context.attributes.targetLeaveAt, countsDown: true)
          .foregroundStyle(Color(hex: 0x1ED760)).monospacedDigit().frame(maxWidth: 48)
      } compactTrailing: {
        Text(timerInterval: context.attributes.clockInAt...Date.distantFuture, countsDown: false)
          .monospacedDigit().frame(maxWidth: 48)
      } minimal: {
        Text(timerInterval: Date()...context.attributes.targetLeaveAt, countsDown: true)
          .foregroundStyle(Color(hex: 0x1ED760)).monospacedDigit()
      }
    }
  }
}
```
`LockScreenView`(진행 링 = `Circle().trim(from:0,to:progress)` + 중앙 남은시간 `Text(timerInterval:)`, 우측 근무시간/목표), `Color(hex:)` 헬퍼도 같은 파일에 정의.
(주의: 다이나믹 아일랜드 compact는 폭 제약이 크므로 `4h`/`5h` 수준 축약 표시가 자연스러우면 `Text(timerInterval:)` 대신 시/분 축약 텍스트 사용을 고려. MVP는 timerInterval 유지.)

- [ ] **Step 2: 빌드 확인**

Run(사용자): `! npx expo prebuild --clean -p ios && yarn ios`
Expected: 위젯 타깃 컴파일 성공. (아직 Activity 시작 전이라 화면엔 안 보임.)

- [ ] **Step 3: 커밋**

```bash
git add src/modules/live-activity/ios/widget/WorkLiveActivityWidget.swift
git commit -m "feat: Live Activity 위젯 UI(잠금화면 L2 + 다이나믹 아일랜드) 구현"
```

---

### Task 5: Swift 모듈 start/end/update/has 구현

**Files:**
- Modify: `src/modules/live-activity/ios/LiveActivityModule.swift`

**Interfaces:**
- Consumes: `WorkActivityAttributes`(Task 3).
- Produces: Task 2의 AsyncFunction 실제 동작.

- [ ] **Step 1: ActivityKit 연동 구현**

`LiveActivityModule.swift`의 함수들을 구현:
- `startWorkActivity(clockInAt, targetLeaveAt)`: ISO8601 파싱 → `WorkActivityAttributes(clockInAt:targetLeaveAt:)` + 초기 `ContentState(progress:)` 계산 → `Activity.request(...)` → `activity.id` 반환. 진행 중인 활동 있으면 먼저 종료.
- `endWorkActivity()`: 모든 `Activity<WorkActivityAttributes>.activities`를 `await activity.end(nil, dismissalPolicy: .immediate)`.
- `updateWorkActivity(targetLeaveAt)`: 현재 활동의 content-state progress 재계산 후 `await activity.update(...)` (attributes의 targetLeaveAt은 정적이라 변경 필요 시 end+start).
- `hasActiveWorkActivity()`: `!Activity<WorkActivityAttributes>.activities.isEmpty`.
- 모두 `if #available(iOS 16.2, *)` 가드.

- [ ] **Step 2: 빌드 확인**

Run(사용자): `! yarn ios`
Expected: 컴파일 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/modules/live-activity/ios/LiveActivityModule.swift
git commit -m "feat: ActivityKit 기반 Live Activity start/end/update/has 구현"
```

---

### Task 6: 앱 연동 — 출퇴근 트리거 + 부팅 동기화

**Files:**
- Create: `src/domain/attendances/liveActivity.ts` (래퍼)
- Modify: `src/app/(tabs)/(home)/attendance.tsx` (clockIn/clockOut onSuccess)
- Modify: `src/app/(tabs)/(home)/index.tsx` 또는 앱 로더 (부팅 동기화)

**Interfaces:**
- Consumes: `decideActivitySync`(T1), `@/modules/live-activity`(T2), `useClockIn`/`useClockOut`/`useTodayAttendance`(기존).
- Produces:
  - `syncWorkActivity(today: AttendanceRecord | undefined): Promise<void>`
  - `onClockInStartActivity(record: AttendanceRecord): Promise<void>`
  - `onClockOutEndActivity(): Promise<void>`

- [ ] **Step 1: 래퍼 구현**

Create `src/domain/attendances/liveActivity.ts`:
```typescript
import { decideActivitySync, type WorkActivityInput } from './liveActivitySync';

import * as LA from '@/modules/live-activity';

export async function onClockInStartActivity(record: AttendanceRecord): Promise<void> {
  const clockInAt = record.clockInTime ? new Date(record.clockInTime).toISOString() : new Date().toISOString();
  const targetLeaveAt = record.leaveWorkAt
    ? new Date(record.leaveWorkAt).toISOString()
    : new Date(new Date(clockInAt).getTime() + 8 * 60 * 60 * 1000).toISOString();
  await LA.startWorkActivity({ clockInAt, targetLeaveAt });
}

export async function onClockOutEndActivity(): Promise<void> {
  await LA.endWorkActivity();
}

export async function syncWorkActivity(today: AttendanceRecord | undefined): Promise<void> {
  const has = await LA.hasActiveWorkActivity();
  const decision = decideActivitySync(today, has);
  if (decision.action === 'start') await LA.startWorkActivity(decision.input);
  else if (decision.action === 'end') await LA.endWorkActivity();
}
```

- [ ] **Step 2: clockIn/clockOut 트리거 연결**

`attendance.tsx`에서 `useClockIn({ onSuccess })`의 onSuccess에 `onClockInStartActivity(data)`, `useClockOut({ onSuccess })`의 onSuccess에 `onClockOutEndActivity()` 추가(기존 onSuccess 로직 보존, await/catch로 안전 처리).

- [ ] **Step 3: 부팅 동기화 연결**

홈 진입 또는 앱 로더에서 `useTodayAttendance().today`가 로드되면 1회 `syncWorkActivity(today)` 호출(useEffect, today 변경 시). iOS 외에서는 내부 가드로 no-op.

- [ ] **Step 4: 실기기/시뮬레이터 통합 검증**

Run(사용자): `! npx expo prebuild --clean -p ios && yarn ios` (iPhone 15+ 시뮬레이터)
시나리오:
- 출근 입력 → 잠금화면에 L2 Live Activity 표시, 남은시간 카운트다운/근무시간 카운트업.
- 다이나믹 아일랜드 compact(좌 남은/우 근무), 길게 눌러 expanded 확인.
- 퇴근 입력 → Activity 종료.
- 앱 강제종료 후 재실행(근무 중 상태) → 동기화로 Activity 재생성.
Expected: 모든 시나리오 정상.

- [ ] **Step 5: Android no-op 확인**

Run(사용자): `! yarn android`
Expected: 출근/퇴근 정상 동작, Live Activity 관련 크래시 없음(모든 호출 no-op).

- [ ] **Step 6: 커밋**

```bash
git add src/domain/attendances/liveActivity.ts "src/app/(tabs)/(home)/attendance.tsx" "src/app/(tabs)/(home)/index.tsx"
git commit -m "feat: 출퇴근에 Live Activity 시작/종료 연동 및 부팅 동기화"
```

---

### Task 7: Phase 3 최종 검증 & 정리

**Files:**
- Modify: 발견된 버그 수정

- [ ] **Step 1: 전체 테스트 & 타입 & lint**

Run: `yarn jest src/domain/attendances && npx tsc --noEmit && yarn lint`
Expected: 통과.

- [ ] **Step 2: 엣지 케이스 점검**

- 목표 퇴근 시각 지난 뒤(초과근무) 잠금화면 카운트다운 0/음수 처리 확인.
- 권한 거부(`areActivitiesEnabled=false`) 시 조용히 무시되는지.
- 중복 출근(이미 Activity 있는데 start) 시 중복 생성 안 되는지(start 내부에서 기존 종료).

- [ ] **Step 3: 발견 항목 수정 후 커밋**

```bash
git add -A
git commit -m "fix: Live Activity 엣지 케이스 처리"
```
Phase 3 완료 → 전체 작업 완료.

---

## Self-Review

- **Spec coverage:** 3.1 네이티브 구성(T2,T3), 3.2 위젯 UI L2+DI(T4), 3.3 JS 브릿지 가드(T2), start/end/update(T5), 3.4 앱 연동 트리거+동기화(T1,T6), 3.5 빌드/검증(T6,T7) — 매핑됨. 다이나믹 아일랜드 좌 남은/우 근무(T4), 네이티브 자동 타이머(T4), iOS-only no-op(T2) 반영.
- **Placeholder scan:** config plugin의 Xcode 타깃 생성 로직(T3 Step2)은 구조와 책임을 명시하되 expo config-plugin의 위젯 익스텐션 추가는 구현 시 헬퍼 선택 필요 — 의도적 위임(외부 라이브러리 금지 제약 하에서 작성). 그 외 placeholder 없음.
- **Type consistency:** `WorkActivityInput`(T1)을 모듈 JS API(T2)·래퍼(T6)가 일관 사용. `WorkActivityAttributes`(T3)를 위젯(T4)·모듈(T5)이 공유. `decideActivitySync` 시그니처(T1) ↔ `syncWorkActivity`(T6) 일관.

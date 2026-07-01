# Phase 3 — 근무시간 LiveActivity (iOS, expo-widgets) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

> **PIVOT (2026-07):** Expo SDK 56 promoted **`expo-widgets`** to stable — iOS Live Activities can be built as React components with `@expo/ui/swift-ui`, **no Swift / no custom Xcode target / no custom config plugin**. This replaces the earlier custom-ActivityKit approach. Task 1 (pure sync logic) is unchanged and kept; the old Tasks 2–7 (native module, config plugin, SwiftUI widget target, ActivityKit) are OBSOLETE and were reverted.

**Goal:** On iOS, start a Live Activity on clock-in and end it on clock-out, showing remaining/worked time on the lock screen and Dynamic Island, using `expo-widgets` (no native code).

**Architecture:** `createLiveActivity(name, component)` registers a Live Activity at runtime; the component is marked `'widget'` and returns a layout object (`banner` = lock screen; `compactLeading/compactTrailing/minimal/expanded*` = Dynamic Island) built from `@expo/ui/swift-ui` components. The app computes display props (remaining/worked labels, progress) and calls `factory.start/instance.update/instance.end`. All iOS-only; Android/web are no-ops. The pure `decideActivitySync` (Task 1) drives boot-time reconciliation.

**Tech Stack:** expo-widgets (SDK 56), @expo/ui/swift-ui, expo-router, TypeScript, jest.

## Global Constraints

- Branch `feature/ui-v3-and-live-activity` (current). iOS-only feature; Android/web all no-op, no crash.
- **No custom Swift / no manual Xcode target / no custom config plugin** — use `expo-widgets` APIs only. (@expo/ui/swift-ui layout is allowed and expected.)
- expo-widgets is NEW: implementers MUST consult the official docs (https://docs.expo.dev/versions/latest/sdk/widgets/) for exact config-plugin options and API signatures; the summaries in this plan may be imprecise on config details.
- Live Activity requires a Dev Client / prebuild build (not Expo Go). Native build + on-device/simulator verification is the USER's checkpoint; subagents verify only `npx tsc --noEmit` (0 errors), `yarn jest`, `yarn lint`, and `npx expo config` where relevant.
- Design (direction A): remaining time is the hero (brand green `#1ed760`), worked time secondary; Dynamic Island compact = left remaining / right worked. Lock screen = progress + remaining/worked (approx L2).
- Trigger data: `clockInAt` = clockInTime, `targetLeaveAt` = leaveWorkAt (or clockInTime+8h). Wrapper reuses `decideActivitySync` (Task 1).
- Commit per task; Korean commit body with conventional prefix.

## Live Activity props (shared shape)

```ts
type WorkActivityProps = {
  clockInAt: string;       // ISO
  targetLeaveAt: string;   // ISO
  progress: number;        // 0..1 elapsed/total
  remainingLabel: string;  // app-computed, e.g. "4:12"
  workedLabel: string;     // app-computed, e.g. "5:48"
  isOvertime: boolean;
};
```
Countdown note: if `@expo/ui/swift-ui` `Text` exposes a SwiftUI timer/relative-date style, use it for a live-ticking remaining time; otherwise pass app-computed `remainingLabel`/`workedLabel` and refresh via `instance.update()` on app foreground / clock events (documented, reliable baseline). The implementer picks based on what @expo/ui actually supports.

---

### Task 1: 동기화 순수 로직 (TDD) — DONE

Already implemented and reviewed (commit `720809a`): `src/domain/attendances/liveActivitySync.ts` + test. `decideActivitySync(today, hasActive)` → `{action:'start',input}|{action:'end'}|{action:'none'}`, `WorkActivityInput = {clockInAt, targetLeaveAt}`. No changes needed.

---

### Task 2: expo-widgets 설치 + app.config 설정

**Files:** Modify `package.json`, `yarn.lock`, `app.config.ts`.

**Interfaces:**
- Produces: `expo-widgets` + `@expo/ui` installed; app.config plugin configured so a Live Activity named (e.g.) `WorkLiveActivity` can be registered; App Group + push (optional) set per docs.

- [ ] **Step 1:** `npx expo install expo-widgets @expo/ui`.
- [ ] **Step 2:** Add the `expo-widgets` config plugin to `app.config.ts` per the OFFICIAL docs. Set `groupIdentifier` (e.g. `group.com.bobpark.ontimeapp`). For a Live Activity (not a home-screen widget), follow the docs exactly on whether/how the activity name is registered (the docs warn a `widgets[]` entry without `supportedFamilies` is for home-screen widgets and can break the build — verify the correct Live-Activity registration form). Do NOT enable push unless needed (`enablePushNotifications` optional).
- [ ] **Step 3:** Verify `npx expo config --json` resolves (plugin accepted, no schema error) and `npx tsc --noEmit` → 0 errors.
- [ ] **Step 4:** Commit — `build: expo-widgets 및 @expo/ui 설치, Live Activity용 app.config 설정`. Stage package.json, yarn.lock, app.config.ts.

**Verification:** `expo config` resolves; tsc 0. (Native prebuild build = user checkpoint.)

---

### Task 3: Live Activity 컴포넌트 (createLiveActivity + @expo/ui 레이아웃)

**Files:** Create `src/domain/attendances/liveActivity/WorkLiveActivity.tsx` (the `'widget'` component + `createLiveActivity` export). Create `src/domain/attendances/liveActivity/types.ts` (`WorkActivityProps`).

**Interfaces:**
- Consumes: `@expo/ui/swift-ui`, `expo-widgets` `createLiveActivity`.
- Produces: default-exported factory from `createLiveActivity('WorkLiveActivity', WorkActivity)`; `WorkActivityProps` type.

- [ ] **Step 1:** Define `WorkActivityProps` (shape above) in `types.ts`.
- [ ] **Step 2:** Implement `WorkActivity(props, environment)` with `'widget'` as its FIRST statement (pure, sync, only `@expo/ui/swift-ui` + modifiers; declare all consts/helpers INSIDE the function; data only via props/environment). Return the layout object:
  - `banner` (lock screen): remaining time large in brand green (tabular), worked time + target secondary, progress. (Approx the chosen L2.)
  - `compactLeading`: remaining (brand). `compactTrailing`: worked. `minimal`: remaining.
  - `expandedLeading/Trailing/Bottom`: remaining (large) / worked / progress.
  - Use `environment.colorScheme` for light/dark colors (brand `#1ed760` both modes).
- [ ] **Step 3:** `export default createLiveActivity('WorkLiveActivity', WorkActivity);` — the name MUST match the app.config registration from Task 2.
- [ ] **Step 4:** `npx tsc --noEmit` → 0 errors. (Widget-runtime restrictions can't be verified without a build — note that the user's build validates the `'widget'` directive constraints.)
- [ ] **Step 5:** Commit — `feat: 근무시간 Live Activity 컴포넌트(@expo/ui 레이아웃, 잠금화면 + 다이나믹 아일랜드)`. Stage the 2 files.

**Verification:** tsc 0; layout regions present. (Visual + widget-runtime = user build.)

---

### Task 4: JS 래퍼 + 앱 연동 (start/update/end + 트리거 + 부팅 동기화)

**Files:** Create `src/domain/attendances/liveActivity/index.ts` (wrapper). Modify `src/app/(tabs)/(home)/attendance.tsx` (clockIn/out onSuccess), and the home screen or app loader for boot sync.

**Interfaces:**
- Consumes: the factory (Task 3), `decideActivitySync` + `WorkActivityInput` (Task 1), `useClockIn`/`useClockOut`/`useTodayAttendance` (existing).
- Produces:
  - `startWorkActivity(input: WorkActivityInput): Promise<void>` (iOS-only; computes props, calls factory.start)
  - `endWorkActivity(): Promise<void>` (ends all active instances via `factory.getInstances()` → `end`)
  - `updateWorkActivity(input): Promise<void>` (recompute props → active instance `.update`)
  - `syncWorkActivity(today): Promise<void>` (uses `decideActivitySync(today, factory.getInstances().length>0)`)
  - a pure `computeWorkActivityProps(input): WorkActivityProps` helper (unit-testable: remaining/worked labels + progress + isOvertime from clockInAt/targetLeaveAt/now) — pass `now` as an arg for testability.

- [ ] **Step 1:** Write a failing test for `computeWorkActivityProps` (labels/progress/isOvertime given fixed clockInAt/targetLeaveAt/now). Run → fail.
- [ ] **Step 2:** Implement `computeWorkActivityProps` + the iOS-guarded wrapper (`Platform.OS==='ios'` else no-op; guard against `expo-widgets` unavailable). Test → pass.
- [ ] **Step 3:** Wire `useClockIn({onSuccess})` → `startWorkActivity({clockInAt, targetLeaveAt})`; `useClockOut({onSuccess})` → `endWorkActivity()` in `attendance.tsx` (preserve existing onSuccess: Haptics, toast).
- [ ] **Step 4:** Boot sync: on `useTodayAttendance().today` load, call `syncWorkActivity(today)` once (useEffect). iOS-only no-op elsewhere.
- [ ] **Step 5:** `yarn jest` (compute test passes) + `npx tsc --noEmit` 0 + `yarn lint` runs.
- [ ] **Step 6:** Commit — `feat: 출퇴근에 Live Activity 시작/종료 연동 및 부팅 동기화`. Stage the wrapper + test + attendance.tsx + boot-sync file.

**Verification:** compute test passes; tsc 0. (Real start/update/end on device = user build.)

---

### Task 5: Phase 3 최종 검증 & 엣지 케이스

**Files:** fixes as needed.

- [ ] **Step 1:** `yarn jest src/domain/attendances` + `npx tsc --noEmit` + `yarn lint` — all green/no new errors.
- [ ] **Step 2:** Edge cases (from code): overtime (remaining ≤ 0 → isOvertime, remaining shows 0/＋), no leaveWorkAt (8h fallback via decideActivitySync), duplicate clock-in (start when already active → update or no dup — decide + guard), Android/web no-op (no crash).
- [ ] **Step 3:** USER build checkpoint: `expo prebuild --clean && yarn ios` (Dev Client). Verify: clock-in shows Live Activity (lock screen + Dynamic Island compact left=remaining/right=worked), clock-out ends it, boot re-sync. Android: clock-in/out normal, no LA crash.
- [ ] **Step 4:** Commit fixes if any — `fix: Live Activity 엣지 케이스 처리`.

---

## Self-Review

- **Spec coverage:** start-on-clock-in/end-on-clock-out (T4), lock screen remaining-large + Dynamic Island left-remaining/right-worked (T3), iOS-only no-op (T4), boot sync via decideActivitySync (T1+T4). Install/config (T2). Countdown handled via @expo/ui timer text OR app-updated labels (T3/T4 note).
- **Placeholder scan:** exact expo-widgets config/API deferred to official docs by design (new library; second-hand summary imprecise). Layout region specifics left to T3 impl within the documented region keys.
- **Type consistency:** `WorkActivityProps` (T3 types.ts) consumed by T4 compute/wrapper; `WorkActivityInput`/`decideActivitySync` (T1) reused by T4.

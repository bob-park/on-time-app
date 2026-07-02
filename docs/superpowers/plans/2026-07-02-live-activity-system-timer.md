# Live Activity 시스템 자동 갱신 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Live Activity의 시간 텍스트를 `Text date+dateStyle('relative')`, progress bar를 `ProgressView timerInterval`로 전환해 앱이 종료돼도 시스템(WidgetKit)이 계속 갱신하게 하고, 잠금화면 배너를 "남은 시간/근무 시간 2열 + progress bar + 출근/퇴근 시각" 레이아웃으로 바꾼다.

**Architecture:** 앱은 정적 라벨(compact 문자열, 출근/퇴근 시각, isOvertime)만 계산해 push하고, 흐르는 시간과 progress bar는 시스템이 렌더링한다. `computeProps.ts`(순수 함수)가 새 flat props를 만들고, `WorkLiveActivity.tsx`('widget' 컴포넌트)가 epoch ms를 `new Date()`로 되살려 relative/timerInterval에 넣는다. 앱 push 흐름(`liveActivity/index.ts`, 홈 화면 분 단위 refresh)은 변경하지 않는다 — compact 문자열 갱신과 초과근무 전환(라벨/색)에 여전히 필요하다.

**Tech Stack:** expo-widgets(`createLiveActivity`, 'widget' directive), `@expo/ui/swift-ui`(`Text`, `ProgressView`, `VStack`, `HStack`, `Spacer`), Jest(jest-expo).

**스펙:** `docs/superpowers/specs/2026-07-02-live-activity-system-timer-design.md`

## Global Constraints

- 'widget' 컴포넌트는 pure + synchronous, `@expo/ui/swift-ui`만 사용, 모든 상수/헬퍼는 함수 안에 선언 (기존 파일 규칙 유지).
- Live Activity props는 flat serializable (string/number/boolean만) — Date 객체 금지, epoch ms number로 전달.
- 색상: 브랜드 그린 `#1ed760`, 위험 빨강 `#f3727f`, 텍스트 흰색 `#ffffff` (기존 값 그대로).
- 라벨 문구: 평시 hero 캡션 `남은 시간`, 초과 시 `초과 근무`, 우측 캡션 `근무 시간`, 하단 `출근` / `퇴근`.
- Dynamic Island compact/minimal은 **변경 금지** (왼쪽 remainingCompact — 초과 시 `+30m`/`+1h` 빨강, 오른쪽 workedCompact).
- 커밋 prefix: `feat` / `test` / `refactor` (lowercase). 커밋 footer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` + `Claude-Session: https://claude.ai/code/session_013JzdXYd4HNY6KkWq6dBUUT`.
- 완료 전 품질 게이트: `yarn lint` 통과, `yarn prettier` diff 없음 (docs/agents/workflows/dev-env.md).
- 테스트 실행은 watch 모드 방지를 위해 `npx jest <path> --watchAll=false` 형태 사용 (`yarn test`는 `--watchAll`).

---

### Task 1: WorkActivityProps 타입 + computeProps 전환 (TDD)

**Files:**
- Modify: `src/domain/attendances/liveActivity/types.ts` (전체 교체)
- Modify: `src/domain/attendances/liveActivity/computeProps.ts` (전체 교체)
- Test: `src/domain/attendances/liveActivity/computeProps.test.ts` (전체 교체)

**Interfaces:**
- Consumes: `WorkActivityInput` (`{ clockInAt: string; targetLeaveAt: string }`, ISO-8601 — `src/domain/attendances/liveActivitySync.ts`에 정의, 변경 없음)
- Produces: `WorkActivityProps` 타입 = `{ clockInAtMs: number; targetLeaveAtMs: number; remainingCompact: string; workedCompact: string; clockInLabel: string; targetLabel: string; isOvertime: boolean }` 및 `computeWorkActivityProps(input: WorkActivityInput, now: Date): WorkActivityProps`. Task 2의 위젯이 이 필드명을 그대로 사용한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/domain/attendances/liveActivity/computeProps.test.ts` 전체를 아래로 교체:

```ts
/// <reference types="jest" />
import { computeWorkActivityProps } from './computeProps';

// Inputs are built with the LOCAL Date constructor (not UTC "…Z" literals) so
// that `clockInLabel`/`targetLabel` — wall-clock times and therefore timezone
// dependent — are deterministic on any machine: `new Date(2026, 5, 30, 18, 0)`
// is always local 18:00. Duration math (compact strings, isOvertime) uses
// getTime() diffs and is timezone-independent.
const clockIn = new Date(2026, 5, 30, 9, 0, 0); // local 09:00
const target = new Date(2026, 5, 30, 18, 0, 0); // local 18:00 → 9h shift

const input = { clockInAt: clockIn.toISOString(), targetLeaveAt: target.toISOString() };

// Build a local Date `hours`:`minutes` on the same shift day.
function at(hours: number, minutes: number): Date {
  return new Date(2026, 5, 30, hours, minutes, 0);
}

describe('computeWorkActivityProps', () => {
  it('근무 중반(4.5h): epoch ms + compact + 출근/퇴근 라벨', () => {
    const props = computeWorkActivityProps(input, at(13, 30)); // 4.5h in

    expect(props).toEqual({
      clockInAtMs: clockIn.getTime(),
      targetLeaveAtMs: target.getTime(),
      remainingCompact: '4h',
      workedCompact: '4h',
      clockInLabel: '09:00',
      targetLabel: '18:00',
      isOvertime: false,
    });
  });

  it('남은 4h12m → compact 4h (compact는 시간 내림)', () => {
    const props = computeWorkActivityProps(input, at(13, 48)); // remaining 4h12m, worked 4h48m

    expect(props.remainingCompact).toBe('4h');
    expect(props.workedCompact).toBe('4h');
    expect(props.isOvertime).toBe(false);
  });

  it('남은 20m → compact 20m (60분 미만은 분 표기)', () => {
    const props = computeWorkActivityProps(input, at(17, 40)); // remaining 20m

    expect(props.remainingCompact).toBe('20m');
    expect(props.workedCompact).toBe('8h');
  });

  it('출근 직후: worked 0m, remaining 9h', () => {
    const props = computeWorkActivityProps(input, clockIn);

    expect(props.workedCompact).toBe('0m');
    expect(props.remainingCompact).toBe('9h');
    expect(props.isOvertime).toBe(false);
    expect(props.clockInLabel).toBe('09:00');
    expect(props.targetLabel).toBe('18:00');
  });

  it('초과 근무: isOvertime true, compact는 초과분 +카운트업', () => {
    const props = computeWorkActivityProps(input, at(19, 15)); // 1h15 past target, 10h15 worked

    expect(props.isOvertime).toBe(true);
    expect(props.remainingCompact).toBe('+1h');
    expect(props.workedCompact).toBe('10h');
  });

  it('한참 초과: +5h', () => {
    const props = computeWorkActivityProps(input, at(23, 0)); // 5h past target

    expect(props.isOvertime).toBe(true);
    expect(props.remainingCompact).toBe('+5h');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx jest src/domain/attendances/liveActivity/computeProps.test.ts --watchAll=false`
Expected: FAIL — `toEqual` 불일치 (기존 구현은 `clockInAt`/`remainingLabel`/`progress` 등을 반환).

- [ ] **Step 3: 타입 + 구현 교체**

`src/domain/attendances/liveActivity/types.ts` 전체를 아래로 교체:

```ts
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
```

`src/domain/attendances/liveActivity/computeProps.ts` 전체를 아래로 교체:

```ts
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
  const targetMs = new Date(input.targetLeaveAt).getTime();
  const nowMs = now.getTime();

  const elapsedMs = nowMs - clockInMs;
  const isOvertime = nowMs > targetMs;
  // Before the target: count down remaining. In overtime: the "remaining" slot
  // instead counts UP the amount past the target, prefixed with "+"
  // (e.g. "+30m"/"+1h"), mirroring the home overtime hero.
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
```

(제거된 것: `formatDuration`, `clamp01`, `progress`/`remainingLabel`/`workedLabel`/ISO string 필드 — 시스템 렌더링으로 대체.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx jest src/domain/attendances/liveActivity/computeProps.test.ts --watchAll=false`
Expected: PASS (6 tests)

참고: 이 시점에 `WorkLiveActivity.tsx`는 사라진 props를 참조하므로 TypeScript 에러 상태다 — Task 2에서 해소된다. Jest(babel transform)는 타입 에러와 무관하게 통과한다.

- [ ] **Step 5: Commit**

```bash
git add src/domain/attendances/liveActivity/types.ts src/domain/attendances/liveActivity/computeProps.ts src/domain/attendances/liveActivity/computeProps.test.ts
git commit -m "refactor: Live Activity props를 시스템 자동 갱신용 epoch ms 기반으로 전환

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013JzdXYd4HNY6KkWq6dBUUT"
```

---

### Task 2: WorkLiveActivity 레이아웃 재작성 (relative 텍스트 + timerInterval progress)

**Files:**
- Modify: `src/domain/attendances/liveActivity/WorkLiveActivity.tsx` (전체 교체)

**Interfaces:**
- Consumes: Task 1의 `WorkActivityProps` (`clockInAtMs`, `targetLeaveAtMs`, `remainingCompact`, `workedCompact`, `clockInLabel`, `targetLabel`, `isOvertime`)
- Produces: `createLiveActivity<WorkActivityProps>('WorkLiveActivity', …)` default export — `liveActivity/index.ts`가 기존 그대로 소비 (변경 불필요).

- [ ] **Step 1: 위젯 컴포넌트 전체 교체**

`src/domain/attendances/liveActivity/WorkLiveActivity.tsx` 전체를 아래로 교체:

```tsx
import { type LiveActivityLayout, createLiveActivity } from 'expo-widgets';

import { HStack, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  tint,
} from '@expo/ui/swift-ui/modifiers';

import type { WorkActivityProps } from './types';

// ────────────────────────────────────────────────────────────────────────────
// WorkLiveActivity — iOS Live Activity for the current work session.
//
// This is an expo-widgets `'widget'` component: it MUST be pure + synchronous,
// may only use `@expo/ui/swift-ui` components/modifiers, and may NOT reference
// React hooks/state/context or any app-level module value. Every constant and
// helper is therefore declared INSIDE the function; all data arrives via
// `props` and `environment`.
//
// Design: the flowing time texts (remaining until target / worked since
// clock-in) are SYSTEM-RENDERED via `Text date + dateStyle('relative')`, and
// the linear progress bar advances on its own via `ProgressView timerInterval`
// — so both keep updating even when the app is terminated. The app only pushes
// static bits: compact Dynamic Island strings, wall-clock labels, and the
// overtime flip (caption "남은 시간" → "초과 근무", accent green → red). If the
// app is dead when the target passes, the relative text naturally counts back
// up past zero (the value doubles as the overtime count-up) but the caption
// and color stay stale until the next app push — an accepted limitation.
// ────────────────────────────────────────────────────────────────────────────
function WorkActivity(props: WorkActivityProps): LiveActivityLayout {
  'widget';

  // --- palette (brand + danger are identical in both color schemes) ---
  const BRAND = '#1ed760';
  const DANGER = '#f3727f';
  // The Live Activity surface (lock screen / Dynamic Island) is always dark, so
  // every label/value except the accent-colored remaining hero is full white —
  // unconditionally, regardless of the device's light/dark scheme.
  const valueColor = '#ffffff';
  const captionColor = '#ffffff';
  const accentColor = props.isOvertime ? DANGER : BRAND;
  const heroLabel = props.isOvertime ? '초과 근무' : '남은 시간';

  const clockInDate = new Date(props.clockInAtMs);
  const targetDate = new Date(props.targetLeaveAtMs);

  // --- shared building blocks (reused across regions) ---
  // System-rendered relative time ("8시간 5분" on Korean devices), updating
  // without app pushes. `lineLimit(1)` + `minimumScaleFactor` shrink the text
  // to fit the narrow Dynamic Island expanded regions instead of truncating.
  // Remaining counts toward the target; past the target the same text counts
  // back up, which doubles as the overtime amount under the "초과 근무" caption.
  const remainingHero = (
    <Text
      date={targetDate}
      dateStyle="relative"
      modifiers={[
        font({ size: 24, weight: 'bold', design: 'rounded' }),
        monospacedDigit(),
        lineLimit(1),
        minimumScaleFactor(0.5),
        foregroundStyle(accentColor),
      ]}
    />
  );

  const workedHero = (
    <Text
      date={clockInDate}
      dateStyle="relative"
      modifiers={[
        font({ size: 24, weight: 'bold', design: 'rounded' }),
        monospacedDigit(),
        lineLimit(1),
        minimumScaleFactor(0.5),
        foregroundStyle(valueColor),
      ]}
    />
  );

  const remainingCompact = (
    <Text
      modifiers={[
        font({ size: 15, weight: 'semibold', design: 'rounded' }),
        monospacedDigit(),
        foregroundStyle(accentColor),
      ]}
    >
      {props.remainingCompact}
    </Text>
  );

  const workedCompact = (
    <Text modifiers={[font({ size: 15, weight: 'medium' }), monospacedDigit(), foregroundStyle(valueColor)]}>
      {props.workedCompact}
    </Text>
  );

  const captionText = (label: string) => (
    <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(captionColor)]}>{label}</Text>
  );

  const valueText = (value: string) => (
    <Text modifiers={[font({ size: 15, weight: 'semibold' }), monospacedDigit(), foregroundStyle(valueColor)]}>
      {value}
    </Text>
  );

  // Linear progress bar driven by the SYSTEM over the clock-in → target
  // interval (`countsDown={false}` fills as time passes; stays full past the
  // target). No app pushes needed.
  const progressBar = (
    <ProgressView
      timerInterval={{ lower: clockInDate, upper: targetDate }}
      countsDown={false}
      modifiers={[tint(accentColor)]}
    />
  );

  // Bottom row: clock-in / target wall-clock times ("09:00 출근 … 퇴근 18:00").
  const clockRow = (
    <HStack alignment="firstTextBaseline" spacing={4}>
      {valueText(props.clockInLabel)}
      {captionText('출근')}
      <Spacer />
      {captionText('퇴근')}
      {valueText(props.targetLabel)}
    </HStack>
  );

  return {
    // ── Lock screen / Notification Center banner ──
    // 남은 시간 | 근무 시간 (two live columns) → progress bar → 출근/퇴근 row.
    banner: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 16, vertical: 12 })]}>
        <HStack alignment="firstTextBaseline" spacing={6}>
          <VStack alignment="leading" spacing={2}>
            {captionText(heroLabel)}
            {remainingHero}
          </VStack>
          <Spacer />
          <VStack alignment="trailing" spacing={2}>
            {captionText('근무 시간')}
            {workedHero}
          </VStack>
        </HStack>
        {progressBar}
        {clockRow}
      </VStack>
    ),

    // ── Dynamic Island: compact (short compact strings avoid ".." truncation) ──
    compactLeading: remainingCompact,
    compactTrailing: workedCompact,

    // ── Dynamic Island: minimal ──
    minimal: remainingCompact,

    // ── Dynamic Island: expanded ──
    expandedLeading: (
      <VStack alignment="leading" spacing={2} modifiers={[padding({ leading: 8 })]}>
        {captionText(heroLabel)}
        {remainingHero}
      </VStack>
    ),
    expandedTrailing: (
      <VStack alignment="trailing" spacing={2} modifiers={[padding({ trailing: 8 })]}>
        {captionText('근무 시간')}
        {workedHero}
      </VStack>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 8 })]}>
        {progressBar}
        {clockRow}
      </VStack>
    ),
  };
}

export default createLiveActivity<WorkActivityProps>('WorkLiveActivity', WorkActivity);
```

- [ ] **Step 2: 타입 에러 해소 확인**

Run: `npx tsc --noEmit`
Expected: 에러 0 (Task 1 이후 남아있던 `WorkLiveActivity.tsx`의 사라진 props 참조 에러가 해소됨).

- [ ] **Step 3: 전체 유닛 테스트 확인**

Run: `npx jest src/domain/attendances --watchAll=false`
Expected: PASS — `computeProps.test.ts` 6개 + `liveActivitySync.test.ts` 6개 (sync 모듈은 건드리지 않았으므로 그대로 통과).

- [ ] **Step 4: Commit**

```bash
git add src/domain/attendances/liveActivity/WorkLiveActivity.tsx
git commit -m "feat: Live Activity 시간/progress를 시스템 자동 갱신(relative, timerInterval)으로 전환

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013JzdXYd4HNY6KkWq6dBUUT"
```

---

### Task 3: 품질 게이트 + 시뮬레이터 검증

**Files:**
- Modify: 없음 (prettier가 재포맷하는 파일이 있으면 그것만)

**Interfaces:**
- Consumes: Task 1–2의 전체 변경
- Produces: 검증 완료된 브랜치 (기능 커밋은 Task 1–2에서 완료)

- [ ] **Step 1: lint**

Run: `yarn lint`
Expected: 에러 0.

- [ ] **Step 2: prettier**

Run: `yarn prettier`
Expected: 변경 파일 없음. `git status`로 확인 — diff가 생겼다면 검토 후:

```bash
git add -A
git commit -m "refactor: prettier 포맷 정리

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_013JzdXYd4HNY6KkWq6dBUUT"
```

- [ ] **Step 3: 시뮬레이터 육안 검증 (UI 변경 — dev-env 가이드)**

Run: `yarn ios` (위젯 번들은 네이티브 빌드에 포함되므로 Metro reload만으로는 반영되지 않을 수 있음 — 전체 빌드 권장)

체크리스트 (앱에서 출근 처리 후 잠금화면/Dynamic Island 확인):
1. 잠금화면 배너: 좌측 "남은 시간" + relative 값(예: "8시간 5분"), 우측 "근무 시간" + relative 값, progress bar, 하단 "09:00 출근 … 퇴근 18:00".
2. relative 텍스트가 분이 바뀔 때 스스로 갱신되는지 (앱을 백그라운드로 보낸 뒤 확인).
3. **앱을 강제 종료(스와이프)** 후에도 시간 텍스트와 progress bar가 계속 흐르는지 — 이번 변경의 핵심.
4. Dynamic Island compact: 왼쪽 남은시간(예: "8h"), 오른쪽 근무시간 — 기존과 동일.
5. expanded: 좌 "남은 시간" hero / 우 "근무 시간" / 하단 progress bar + 출근/퇴근 라벨. 좁은 영역에서 relative 텍스트가 잘리지 않고 축소되는지.
6. (가능하면) 퇴근 목표 시각을 가까운 시간으로 설정해 초과근무 전환 확인: 앱이 foreground면 1분 내 "초과 근무" 라벨 + 빨강 전환, relative 값이 초과분으로 카운트업.
7. 한국어 로케일에서 relative 형식이 "8시간 5분" 꼴인지 확인 (다르면 폰트 크기/레이아웃 조정 판단).

Expected: 위 7개 항목 모두 확인. 3번이 실패하면(앱 종료 시 멈춤) 설계 전제가 깨진 것이므로 중단하고 보고.

- [ ] **Step 4: 완료 보고**

superpowers:verification-before-completion 체크 후 사용자에게 결과 보고 (시뮬레이터 스크린샷 포함 가능하면 첨부). 이후 브랜치 마무리는 superpowers:finishing-a-development-branch — PR base는 `develop` (docs/agents/workflows/git.md).

---

## Self-Review 결과

- **Spec coverage:** props 변경(Task 1), computeProps(Task 1), 배너/expanded 레이아웃 + relative/timerInterval(Task 2), compact 불변(Task 2 코드에 기존 블록 유지), 업데이트 흐름 무변경(계획상 태스크 없음 — 스펙과 일치), 테스트 갱신(Task 1), 시뮬레이터 검증(Task 3). 누락 없음.
- **Placeholder scan:** 모든 코드 스텝에 전체 파일 내용 포함. TBD 없음.
- **Type consistency:** `clockInAtMs`/`targetLeaveAtMs`/`remainingCompact`/`workedCompact`/`clockInLabel`/`targetLabel`/`isOvertime` — Task 1 정의와 Task 2 사용 일치. `WorkActivityInput`은 무변경으로 `liveActivitySync.ts`/`index.ts`와 정합.

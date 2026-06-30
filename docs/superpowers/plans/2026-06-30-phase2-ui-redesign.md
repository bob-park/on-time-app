# Phase 2 — 모던 UI 리디자인 (방향 A · 라이트+다크) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On Time 앱 전 화면을 Spotify Dark Immersive 방향(방향 A)으로 라이트·다크 모두 지원하도록 리디자인하되, 홈·출퇴근 화면을 최우선으로 완성한다.

**Architecture:** Phase 1에서 정의한 디자인 토큰(NativeWind 5/Tailwind 4 CSS-first — `src/app/global.css`의 `@theme` 블록에 `--color-*` 로 정의됨; `tailwind.config.js`는 NW5에서 제거됨)을 단일 출처로 사용한다. 재사용 공용 컴포넌트(Button/Card/StatTile/Badge/ProgressBar/ProgressRing/SectionHeader)를 먼저 만들고, 화면들을 그 위에서 재구성한다. NativeWind `dark:` 클래스로 다크/라이트를 분기하며, iOS는 expo-glass-effect 표면을 사용한다.

**Tech Stack:** NativeWind 5 + Tailwind 4(토큰), react-native-reanimated(기존 motion), expo-glass-effect, expo-symbols, expo-image, react-i18next.

## Global Constraints

- 작업 브랜치: `feature/ui-v3-and-live-activity`. **Phase 1이 완료(빌드 통과)된 상태에서 시작.**
- 디자인 토큰은 `src/app/global.css`의 `@theme` 블록(`--color-base/surface/elevated/border/content/muted/brand/danger` + 각 `-dark`)에서 파생된 시맨틱 유틸리티만 사용(`bg-base`, `dark:bg-surface-dark`, `text-content`, `bg-brand`, `border-brand-border`, `text-danger` 등). 하드코딩 hex 신규 추가 금지(그라데이션 등 불가피한 경우 제외).
- 액센트는 브랜드 그린 `#1ed760` 단일. 기능적 사용만(장식 금지).
- 버튼은 pill 지오메트리(`rounded-full`), 시간/숫자는 `fontVariant: ['tabular-nums']`.
- 다크/라이트: 모든 표면·텍스트는 `dark:` 변형을 가진다. `darkMode: 'class'`.
- iOS 글래스 표면은 `expo-glass-effect`, Android는 솔리드 surface로 폴백.
- `docs/agents/workflows/design-workflow.md` 6단계 계약 준수: 추가 시각 검토 필요 시 임시 디렉토리 HTML 목업 + 로컬 서버 → 확정분만 `src/` 반영.
- 한국어 카피는 가능하면 i18n 키로(`t('...')`); 점진 이전이므로 신규/수정 문자열만 키화해도 됨.
- 각 화면 태스크는 시뮬레이터(iOS+Android, 라이트+다크)에서 검증 후 커밋.

## 우선순위

1. **공용 컴포넌트(T1)** → **홈(T2)** → **출퇴근(T3)** (핵심)
2. 더보기·테마(T4) → 연차(T5) → 스케줄·투두(T6) → 알림(T7) → 로그인·기타(T8) → 탭바 토큰화(T9) → 최종 패스(T10)

---

### Task 1: 디자인 토큰 기반 공용 컴포넌트

**Files:**
- Create: `src/shared/components/ui/Button.tsx`
- Create: `src/shared/components/ui/Card.tsx`
- Create: `src/shared/components/ui/StatTile.tsx`
- Create: `src/shared/components/ui/StatusPill.tsx`
- Create: `src/shared/components/ui/ProgressBar.tsx`
- Create: `src/shared/components/ui/ProgressRing.tsx`
- Create: `src/shared/components/ui/SectionHeader.tsx`
- Create: `src/shared/components/ui/index.ts` (barrel export)

**Interfaces:**
- Consumes: tailwind 토큰(Phase 1 T3), 기존 `@/shared/components/motion/AnimatedPressable`.
- Produces:
  - `Button({ variant?: 'primary' | 'secondary' | 'outline', label: string, onPress, disabled?, icon? })`
  - `Card({ className?, children })` — surface+border 컨테이너
  - `StatTile({ label: string, value: string, accent?: boolean })`
  - `StatusPill({ label: string, tone?: 'brand' | 'danger' | 'muted', pulse?: boolean })`
  - `ProgressBar({ progress: number /* 0..100 */, tone?: 'brand' | 'danger' })`
  - `ProgressRing({ progress: number, size?: number, label?: string })`
  - `SectionHeader({ title: string, action?: ReactNode })`

- [ ] **Step 1: Button 구현**

Create `src/shared/components/ui/Button.tsx`:
```tsx
import { Text, View } from 'react-native';

import { AnimatedPressable } from '@/shared/components/motion/AnimatedPressable';

type Variant = 'primary' | 'secondary' | 'outline';

const VARIANT: Record<Variant, { box: string; text: string }> = {
  primary: { box: 'bg-brand', text: 'text-black' },
  secondary: { box: 'bg-elevated dark:bg-elevated-dark', text: 'text-content dark:text-content-dark' },
  outline: { box: 'border border-border dark:border-border-dark', text: 'text-content dark:text-content-dark' },
};

export function Button({
  variant = 'primary',
  label,
  onPress,
  disabled,
  icon,
}: {
  variant?: Variant;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const v = VARIANT[variant];
  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      className={`flex-row items-center justify-center gap-2 rounded-full px-5 py-3.5 ${v.box} ${disabled ? 'opacity-50' : ''}`}
    >
      {icon}
      <Text className={`text-base font-extrabold ${v.text}`}>{label}</Text>
    </AnimatedPressable>
  );
}
```
(주의: 토큰 클래스명은 Phase 1 T3에서 정의한 색 키와 일치해야 한다 — `bg-surface`/`dark:bg-surface-dark` 형태. NativeWind 5에서 `surface-dark` 대신 `dark:bg-surface` 형태로 토큰을 구성했다면 그에 맞춘다. 토큰 적용 첫 컴포넌트이므로, 실제 토큰 출력 형태를 `npx expo start`로 1회 확인 후 나머지 컴포넌트에 동일 규칙 적용.)

- [ ] **Step 2: Card / StatTile / StatusPill 구현**

Create `src/shared/components/ui/Card.tsx`:
```tsx
import { View } from 'react-native';

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <View className={`rounded-3xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark ${className}`}>{children}</View>;
}
```
Create `src/shared/components/ui/StatTile.tsx`:
```tsx
import { Text, View } from 'react-native';

export function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
      <Text className="text-xs font-semibold text-muted dark:text-muted-dark">{label}</Text>
      <Text
        className={`mt-1 text-xl font-extrabold ${accent ? 'text-brand' : 'text-content dark:text-content-dark'}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}
```
Create `src/shared/components/ui/StatusPill.tsx`:
```tsx
import { Text, View } from 'react-native';

const TONE = {
  brand: 'text-brand',
  danger: 'text-danger dark:text-danger-dark',
  muted: 'text-muted dark:text-muted-dark',
} as const;

export function StatusPill({ label, tone = 'brand' }: { label: string; tone?: keyof typeof TONE; pulse?: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full bg-elevated px-2.5 py-1 dark:bg-elevated-dark">
      <View className={`size-2 rounded-full ${tone === 'brand' ? 'bg-brand' : tone === 'danger' ? 'bg-danger' : 'bg-muted'}`} />
      <Text className={`text-xs font-bold ${TONE[tone]}`}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 3: ProgressBar / ProgressRing / SectionHeader 구현**

Create `src/shared/components/ui/ProgressBar.tsx`:
```tsx
import { View } from 'react-native';

export function ProgressBar({ progress, tone = 'brand' }: { progress: number; tone?: 'brand' | 'danger' }) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  return (
    <View className="h-1.5 overflow-hidden rounded-full bg-elevated dark:bg-elevated-dark">
      <View className={`h-full rounded-full ${tone === 'brand' ? 'bg-brand' : 'bg-danger'}`} style={{ width: `${clamped}%` }} />
    </View>
  );
}
```
Create `src/shared/components/ui/ProgressRing.tsx` — `react-native-svg`의 `Circle` stroke-dashoffset으로 진행 링 구현(size 기본 78, stroke 6, 트랙 `#282828`/`#e6e6ea`, 진행 `#1ed760`, 중앙에 `label`). Create `src/shared/components/ui/SectionHeader.tsx` — 좌측 title(bold) + 우측 action 슬롯.

- [ ] **Step 4: barrel export**

Create `src/shared/components/ui/index.ts`:
```typescript
export { Button } from './Button';
export { Card } from './Card';
export { StatTile } from './StatTile';
export { StatusPill } from './StatusPill';
export { ProgressBar } from './ProgressBar';
export { ProgressRing } from './ProgressRing';
export { SectionHeader } from './SectionHeader';
```

- [ ] **Step 5: 토큰 렌더 확인**

Run: `npx expo start -c` — 임시 화면 또는 홈에 컴포넌트 1개씩 배치해 라이트/다크에서 색이 맞는지 확인(또는 `! yarn ios`).
Expected: surface/brand/text 토큰이 라이트·다크 모두 의도대로 렌더.

- [ ] **Step 6: 커밋**

```bash
git add src/shared/components/ui
git commit -m "feat: 디자인 토큰 기반 공용 UI 컴포넌트 추가"
```

---

### Task 2: 홈 화면 리디자인 (최우선)

**Files:**
- Modify: `src/app/(tabs)/(home)/index.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui` (Task 1), `useTodayAttendance`(기존), work-state 로직(기존 `getWorkState`).
- Produces: 방향 A 스타일 홈. work-state별 히어로 카드(before/working/overtime/done).

- [ ] **Step 1: work-state 히어로 카드를 토큰 기반으로 재작성**

기존 `HeroBeforeWork/HeroWeekend/HeroWorking/HeroOvertime/HeroDone`를 방향 A로 재구성:
- 배경: `LinearGradient` 제거 → `bg-surface dark:bg-surface-dark` + `border-border`(working 상태는 brand 보더 포인트), overtime은 `border-danger`.
- 남은시간을 `text-5xl`~`text-6xl` `text-brand` `font-extrabold` `tabular-nums`로 크게.
- 목표 퇴근/출근시각은 우측 보조.
- 진행: `ProgressBar`(working=brand, overtime=danger, 100%).
- 상태 표시: `StatusPill`(근무중/초과/주말).
- CTA: `Button`(working/overtime=primary green "퇴근 입력", before/weekend=primary "출근 입력").

- [ ] **Step 2: 하단 stat 타일 영역**

홈 하단에 `StatTile` 2개(이번주 근무시간 / 남은 연차) 행. 데이터가 없으면 `--`로 표시.

- [ ] **Step 3: 기존 애니메이션 보존**

기존 reanimated 진행바 애니메이션·pulse는 `ProgressBar`/`StatusPill`에 맞게 유지(progress shared value, pulse opacity). 카드 진입 애니메이션(enterHero/enterPage)도 유지.

- [ ] **Step 4: 시뮬레이터 검증 (라이트/다크 × 4 상태)**

Run(사용자): `! yarn ios`
Expected: before/working/overtime/done + weekend 상태가 라이트·다크 모두 의도대로. 남은시간 강조, 그린 액센트, pill CTA.

- [ ] **Step 5: 커밋**

```bash
git add "src/app/(tabs)/(home)/index.tsx"
git commit -m "feat: 홈 화면을 방향 A(Spotify Dark) 스타일로 리디자인"
```

---

### Task 3: 출퇴근 화면 리디자인 (최우선)

**Files:**
- Modify: `src/app/(tabs)/(home)/attendance.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui`, `useClockIn`/`useClockOut`/`useTodayAttendance`(기존), GPS 쿼리(기존).
- Produces: 방향 A 스타일 출퇴근 화면.

- [ ] **Step 1: 출/퇴근 입력 카드 재구성**

- 워크타입(OFFICE/OUTSIDE/HOME) 선택을 pill 세그먼트(`StatusPill`/pill 버튼 group)로.
- GPS 상태(위치 확인/오차)를 `Card` 안에 표시, 상태색은 brand/danger.
- 현재 상태(출근 전/근무중)에 따라 메인 CTA를 `Button` primary로(출근/퇴근).

- [ ] **Step 2: 시간/위치 표시 토큰 적용**

시각 표시는 tabular-nums, 보조 텍스트는 `text-muted`. 배경 `bg-base dark:bg-base-dark`.

- [ ] **Step 3: 시뮬레이터 검증**

Run(사용자): `! yarn ios`
Expected: 출근→퇴근 플로우가 라이트·다크 모두 정상. 워크타입 선택, GPS 상태, CTA 동작.

- [ ] **Step 4: 커밋**

```bash
git add "src/app/(tabs)/(home)/attendance.tsx"
git commit -m "feat: 출퇴근 화면을 방향 A 스타일로 리디자인"
```

---

### Task 4: 더보기 · 테마 화면 리디자인

**Files:**
- Modify: `src/app/(tabs)/(more)/index.tsx`
- Modify: `src/app/(tabs)/(more)/theme.tsx`
- Modify: `src/app/(tabs)/(more)/notifications.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui`, theme store(`themePreference`/`setThemePreference` from Phase 1 T5).

- [ ] **Step 1: 설정 리스트 row 컴포넌트화**

`(more)/index`의 설정 항목을 `Card` + row(아이콘 + 라벨 + chevron) 패턴으로. 아이콘은 `expo-symbols`(iOS) 또는 기존 vector-icons.

- [ ] **Step 2: 테마 3-way 선택 UI**

`(more)/theme`에서 system/light/dark 3개 옵션을 선택 카드(선택 시 brand 보더/체크)로. 선택은 `setThemePreference` 호출.

- [ ] **Step 3: 알림 설정 토큰 적용**

`(more)/notifications` 리스트/토글 토큰화.

- [ ] **Step 4: 검증 & 커밋**

Run(사용자): `! yarn ios` — 테마 전환이 즉시 반영되는지 확인.
```bash
git add "src/app/(tabs)/(more)"
git commit -m "feat: 더보기·테마·알림설정 화면 리디자인 및 테마 3-way UI"
```

---

### Task 5: 연차 화면 리디자인

**Files:**
- Modify: `src/app/(tabs)/(home)/dayoff/add.tsx`
- Modify: `src/app/(tabs)/(home)/dayoff/histories.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui`, 기존 dayoff 쿼리, FlashList.

- [ ] **Step 1: 연차 신청 폼(add) 토큰 적용**

날짜 선택(react-native-ui-datepicker), 연차 타입(DAY_OFF/AM_HALF/PM_HALF) pill 세그먼트, 사유 입력 — `Card`/`Button`/pill로 재구성.

- [ ] **Step 2: 연차 내역(histories) 리스트 토큰 적용**

FlashList row를 `Card`/`StatusPill`(상태별 tone)로. 빈 상태 메시지 토큰화.

- [ ] **Step 3: 검증 & 커밋**

Run(사용자): `! yarn ios`
```bash
git add "src/app/(tabs)/(home)/dayoff"
git commit -m "feat: 연차 신청·내역 화면 리디자인"
```

---

### Task 6: 스케줄 · 투두 화면 리디자인

**Files:**
- Modify: `src/app/(tabs)/schedule.tsx`
- Modify: `src/app/(tabs)/todo.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui`, 기존 쿼리.

- [ ] **Step 1: 스케줄 surface/리스트 토큰 적용**

캘린더/리스트 표면을 `bg-base`/`Card`로, 항목 강조는 brand.

- [ ] **Step 2: 투두 리스트 토큰 적용**

체크박스/항목 row를 토큰화, 완료 상태는 muted, 액센트 brand.

- [ ] **Step 3: 검증 & 커밋**

Run(사용자): `! yarn ios`
```bash
git add "src/app/(tabs)/schedule.tsx" "src/app/(tabs)/todo.tsx"
git commit -m "feat: 스케줄·투두 화면 리디자인"
```

---

### Task 7: 알림 화면 리디자인

**Files:**
- Modify: `src/app/(tabs)/(home)/notifications.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui`, 기존 `useNotificationHistories`.

- [ ] **Step 1: 알림 리스트 토큰 적용**

알림 항목을 `Card` row(읽음/안읽음 brand 점)로. 빈 상태 토큰화.

- [ ] **Step 2: 검증 & 커밋**

Run(사용자): `! yarn ios`
```bash
git add "src/app/(tabs)/(home)/notifications.tsx"
git commit -m "feat: 알림 화면 리디자인"
```

---

### Task 8: 로그인 · 콜백 · not-found 리디자인

**Files:**
- Modify: `src/app/login.tsx`
- Modify: `src/app/callback.tsx`
- Modify: `src/app/+not-found.tsx`

**Interfaces:**
- Consumes: `@/shared/components/ui`, 기존 auth 로직.

- [ ] **Step 1: 로그인 화면**

브랜드 로고/타이틀 + 그린 primary `Button`(로그인). 배경 `bg-base dark:bg-base-dark`. 로그인 로직은 변경 없음.

- [ ] **Step 2: callback / +not-found**

로딩/에러 화면을 토큰화(스피너 brand, 메시지 muted). not-found에 홈 복귀 `Button`.

- [ ] **Step 3: 검증 & 커밋**

Run(사용자): `! yarn ios`
```bash
git add src/app/login.tsx src/app/callback.tsx src/app/+not-found.tsx
git commit -m "feat: 로그인·콜백·not-found 화면 리디자인"
```

---

### Task 9: 탭바 토큰 최종화 (iOS NativeTabs / Android JS Tabs)

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`
- Modify: `src/app/(tabs)/_layout.ios.tsx`
- Modify: `src/app/_layout.tsx` (Stack contentStyle 배경 토큰)

**Interfaces:**
- Consumes: 토큰, expo-glass-effect(iOS).

- [ ] **Step 1: Android JS Tabs 색/배경 토큰화**

`_layout.tsx`의 `tabBarActiveTintColor`를 `#1ed760`, 비활성은 muted, `tabBarStyle` 배경을 surface로. 다크/라이트 분기는 `useColorScheme`로.

- [ ] **Step 2: iOS NativeTabs 글래스/틴트**

`_layout.ios.tsx`에 brand 틴트/글래스 표면 적용(expo-glass-effect 또는 NativeTabs 기본 글래스).

- [ ] **Step 3: 루트 Stack 배경 토큰**

`src/app/_layout.tsx`의 `contentStyle.backgroundColor`를 다크 `#000000` / 라이트 `#f7f7f8`로(현재 colorScheme 기반).

- [ ] **Step 4: 검증 & 커밋**

Run(사용자): `! yarn ios` 그리고 `! yarn android`
```bash
git add "src/app/(tabs)/_layout.tsx" "src/app/(tabs)/_layout.ios.tsx" "src/app/_layout.tsx"
git commit -m "feat: 탭바 및 루트 배경 디자인 토큰 최종화"
```

---

### Task 10: 전 화면 일관성 최종 패스

**Files:**
- Modify: 발견된 불일치 화면들

**Interfaces:**
- Consumes: 전체.

- [ ] **Step 1: 라이트/다크 전수 점검 체크리스트**

각 화면(홈/출퇴근/연차add·histories/스케줄/투두/알림/더보기·테마·알림설정/로그인/callback/not-found)을 라이트·다크에서 순회하며 점검: 하드코딩 색 잔존, 대비 부족, tabular-nums 누락, pill 일관성, 빈 상태.

- [ ] **Step 2: 잔존 하드코딩 색 grep**

Run: `grep -rn "#[0-9a-fA-F]\{6\}" src/app src/domain | grep -v "1ed760\|1db954"`
Expected: 의도된 그라데이션/예외만 남음. 그 외는 토큰으로 교체.

- [ ] **Step 3: lint & 타입체크**

Run: `yarn lint && npx tsc --noEmit`
Expected: 통과.

- [ ] **Step 4: 발견 항목 수정 후 커밋**

```bash
git add -A
git commit -m "polish: 전 화면 라이트/다크 일관성 최종 패스"
```
Phase 2 완료.

---

## Self-Review

- **Spec coverage:** 2.1 토큰(Phase1 T3 + 본 플랜 전반), 2.2 공용 컴포넌트(T1), 2.3 화면별(T2~T8), 2.4 다크/라이트 토글(T4 테마 + 전반 `dark:`), 2.5 작업방식(Global Constraints) — 매핑됨. 홈·출퇴근 우선(T2,T3) 반영.
- **Placeholder scan:** ProgressRing/SectionHeader는 구현 방향을 명시(svg stroke-dashoffset, title+action) — 시각 컴포넌트로 정확한 최종 JSX는 구현 시 결정. 화면 태스크는 "어떤 토큰/컴포넌트로 무엇을 바꾸는지"를 명시하되 12개 화면의 최종 JSX를 사전 고정하지 않음(불가피·의도적; design-workflow 계약상 확정분만 반영).
- **Type consistency:** 공용 컴포넌트 prop 시그니처(T1 Interfaces) 일관, 화면들이 동일 컴포넌트를 소비.

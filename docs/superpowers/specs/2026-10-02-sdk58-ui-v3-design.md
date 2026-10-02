# Expo SDK 58 마이그레이션 + UI v3 (Kraken) 디자인 스펙

- 날짜: 2026-10-02
- 브랜치: `feature/ui-v3`
- 참고: `/Users/hwpark/Documents/rn-workspace/template-expo-app` (커밋 `99e3ee1`, `ef439b2`, `b602387`, `95cef15`), `docs/design/kraken-design.md`
- 확정 목업: 홈 A+C 조합, 화면 6종(`screens-v1`) — brainstorming 세션에서 승인

## 목표

1. Expo SDK 를 56 → 57 → 58(beta) 단계적으로 올리고 `NativeTabs` import 를 `expo-router/native-tabs` 로 변경한다.
2. Kraken 디자인 토큰으로 전체 UI 를 개편한다. 최우선 사용성 목표는 **출퇴근을 가장 빠르게** 하는 것이다.

### 성공 기준

- SDK 58 에서 `tsc`, `yarn lint`, `yarn prettier`(diff 없음), `jest` 통과, iOS 시뮬레이터 빌드/실행 성공.
- 홈 진입 후 출퇴근 버튼까지 탭 1 회, 엄지 영역(하단 고정)에 위치.
- 모든 화면이 라이트/다크 모드에서 토큰 기반 색만 사용(`gray-*` 하드코딩 0).

### 사전 확인 사항

- 현재 실제 SDK 는 56 (`expo@56.0.12`). 요청의 "57 → 58" 대신 56 → 57 → 58 로 진행한다.
- SDK 58 은 beta 이며 template 은 `react-native 0.88.0-rc.3`, `react-native-css 3.1.0-rc.0` RC 핀을 사용한다. 동일하게 따른다.

---

## Part 1. SDK 마이그레이션

`expo:expo-upgrade` 스킬을 사용한다. 각 단계는 독립 커밋이며, 단계 검증이 끝나기 전에는 다음 단계로 넘어가지 않는다.

| 단계 | 내용 | 버전 기준 | 커밋 |
|---|---|---|---|
| 1 | `expo@^57` + `npx expo install --fix` | template `99e3ee1` | `build: expo sdk 57 업그레이드` |
| 2 | `expo@^58` + `npx expo install --fix`, RC 핀 반영, 타입 변경 수정(예: Ionicons `color as string`) | template `ef439b2`, `b602387` | `build: expo sdk 58 (beta) 업그레이드` |
| 3 | `src/app/(tabs)/_layout.ios.tsx` import → `expo-router/native-tabs` (`expo:expo-router` 스킬 참고) | template `95cef15` | `refactor: NativeTabs import 경로를 expo-router/native-tabs 로 변경` |
| 4 | `docs/agents/tech-stack.md` 버전 표기 갱신 | template `ef439b2` | `docs: tech-stack 갱신` |

### on-time-app 고유 위험 요소 (template 에 없음)

- `expo-widgets` + `@expo/ui/swift-ui` (Live Activity): `expo install` 이 고른 버전을 사용한다. SwiftUI modifier API 가 바뀐 경우 `src/domain/attendances/liveActivity/WorkLiveActivity.tsx` 만 최소 수정한다.
- `jest-expo`, `@react-native/jest-preset`, `react-test-renderer`, `react-native-ui-datepicker`, `@expo/metro-runtime`: SDK 에 맞춰 정렬한다.
- `android/` 는 git ignore 된 생성물이다. 필요 시 prebuild 로 재생성한다.

### 실패 처리

빌드가 깨지면 해당 단계 안에서 `superpowers:systematic-debugging` 으로 원인을 찾는다. 해결되지 않으면 다음 단계로 넘어가지 않고 사용자에게 보고한다.

---

## Part 2. UI v3

### 접근

기존 NativeWind 토큰 이름은 유지하고 값만 교체한다 → 기존 토큰 사용 코드는 자동 반영. 공용 컴포넌트를 보강하고, 목업에서 2 회 이상 반복되는 패턴만 새 컴포넌트로 만든다. 화면은 목업대로 재작성한다. 별도 디자인 시스템 레이어/TS 토큰 객체는 만들지 않는다.

### 2.1 토큰 (`src/app/global.css` `@theme`)

| 토큰 | Light | Dark |
|---|---|---|
| `base` | `#f7f7fa` | `#0b0b10` |
| `surface` | `#ffffff` | `#17171f` |
| `elevated` | `#f0f0f5` | `#22222c` |
| `border` | `#dedee5` | `#26262f` |
| `content` | `#101114` | `#f2f2f7` |
| `muted` | `#9497a9` | `#9497a9` |
| `brand` | `#7132f5` | `#855bfb` |
| `danger` | `#e0455a` | `#ff9aa8` |

신규 토큰:

- `brand-deep`: `#5b1ecf` (다크 Hero 그라데이션)
- `brand-subtle`: `rgba(133,91,251,0.16)` (아이콘 배경, brand 배지)
- `success`: `#149e61`, `success-dark`(배지 텍스트): `#026b3f`

탭 레이아웃(`_layout.ios.tsx`, `_layout.tsx`)의 `#1ed760` 하드코딩을 brand 로 교체한다.

폰트: 커스텀 폰트(Kraken-Brand)는 사용하지 않는다. 시스템 폰트 + 굵기 700 + 자간 -0.5px 로 헤딩 위계를 표현한다.

### 2.2 공용 컴포넌트 (`src/shared/components/ui/`)

수정:

- `Button`: `rounded-xl`(12px), primary 텍스트 흰색. variant = `primary` / `secondary`(회색 8%) / `subtle`(퍼플 16%). 사용처 없는 `outline` 은 제거.
- `Card`: `rounded-2xl`(16px) + 옅은 그림자(`rgba(0,0,0,0.03) 0 4 24`), 테두리 제거. 다크는 그림자 없이 `surface-dark`.
- `StatusPill`, `SectionHeader`, `ProgressBar`: 토큰만 반영.

제거:

- `StatTile` (빠른 실행으로 대체), `ProgressRing` (사용처 없음).

신규:

| 컴포넌트 | Props | 사용처 |
|---|---|---|
| `Segmented` | `{ options, value, onChange }` | 일정(내/동료), 휴가 신청(연차/보상휴가). 기존 `SelectedButton` 이 같은 역할이면 대체 |
| `ChoiceChip` | `{ label, selected, onPress, icon? }` | 근무 형태, 휴가 사용 단위 |
| `ListGroup` + `ListItem` | `ListItem: { label, value?, onPress?, right? }` | 더보기, 일정 리스트, 휴가 내역 |
| `QuickAction` | `{ icon, label, sub, onPress }` | 홈 2×2 |
| `Badge` | `{ label, variant: 'brand' \| 'success' \| 'neutral' }` (6px radius) | 일정/휴가 내역 |

### 2.3 탐색 구조

- 탭 4 → 3: `오늘 · 일정 · 더보기`. `src/app/(tabs)/todo.tsx` 삭제, 두 탭 레이아웃에서 트리거 제거.
- 출퇴근 입력 `(home)/attendance` 를 `(home)/_layout.tsx` Stack 에서 `presentation: 'formSheet'` (detent ≈ `[0.75]`) 로 표시.
- 휴가 신청/내역, 알림은 기존 Stack push 유지.
- `(home)`, `(more)` 레이아웃의 하드코딩 배경(`bg-gray-50`, `#f9fafb`, `#030712`)을 `base` 토큰으로 교체.

### 2.4 화면별 변경

**홈 `(home)/index.tsx`** — 현재 660 줄이므로 상태별 Hero/섹션을 같은 디렉토리가 아닌 `src/domain/attendances/components/` 로 분리한다.

- Hero: 기존 상태 분기(before / working / overtime / done / weekend / skeleton) 유지. 퍼플 카드(라이트), `brand-deep` 그라데이션(다크, `expo-linear-gradient`), overtime 은 `danger` 색.
- 하단 고정 CTA: 탭바 위 absolute 배치, ScrollView 하단 여백 확보.
  - before → "출근하기", working/overtime → "퇴근하기", done/weekend → 숨김.
  - 문구 결정 로직은 순수 함수(`getHomeCta(workState, isWeekend)`)로 분리하고 jest 테스트 작성.
- 빠른 실행 2×2 (`QuickAction`), 실제 데이터만 사용:
  - 휴가 신청 — 잔여 연차 (`useUserLeaveEntry`: `totalLeaveDays − usedLeaveDays`)
  - 보상휴가 — 잔여 보상휴가 (`totalCompLeaveDays − usedCompLeaveDays`), 탭 시 휴가 신청을 보상휴가 세그먼트로 오픈
  - 휴가 내역 — 올해 건수 (`useVacations`)
  - 알림 — 읽지 않은 알림 수. 헤더 벨 아이콘은 제거.
- 제거: `StatTile` 2 개("--" 플레이스홀더), 동작하지 않던 "근무 확인 / 내 정보" 바로가기. 주간 근무시간 API 가 없으므로 "이번 주" 지표는 넣지 않는다.

**출퇴근 입력 `(home)/attendance.tsx`** (바텀시트)

- 큰 현재 시각, 근무 형태 `ChoiceChip` 3 개(사무실/외근/재택), 위치 상태 카드 3 상태(확인 중=muted / 확인됨=success / 범위 밖=danger), 하단 고정 확인 버튼.
- GPS, `useClockIn`/`useClockOut`, Live Activity 연동 로직은 변경하지 않는다.

**일정 `schedule.tsx`**

- `Segmented`(내 일정 / 동료 일정), 기존 월 이동 유지, 일정이 있는 날짜에 점 표시.
- 리스트: `ListGroup` + `Badge` (연차=brand, 보상휴가=neutral). 공휴일 데이터가 없으면 공휴일 배지는 만들지 않는다.

**휴가 신청 `(home)/dayoff/add.tsx`**

- `Segmented` 에 잔여일 표시, 시작/종료 날짜 필드, 사용 단위 `ChoiceChip`(종일 / 오전 반차 / 오후 반차), 사유 입력.
- 신청 후 잔여일 미리보기 카드, 하단 고정 "신청하기".
- 라우트 파라미터로 초기 세그먼트(연차/보상휴가) 지정 가능.

**휴가 내역 `(home)/dayoff/histories.tsx`**

- `ListGroup` + `ApprovalStatus` 별 `Badge`: `DRAFT` 임시저장=neutral, `WAITING`/`PROCEEDING` 진행중=brand, `APPROVED` 승인=success, `REJECTED` 반려=neutral(텍스트 danger). 빈 상태 문구 정리.

**더보기 `(more)/index.tsx`, `theme.tsx`, `notifications.tsx`**

- 프로필 카드 + `ListGroup` 두 개(근무 / 설정), 오른쪽에 현재 값 표시(알림 켜짐, 테마 시스템 등), 하단 로그아웃(danger 텍스트).

**로그인 `login.tsx`, `+not-found.tsx`**

- 로그인: 퍼플 CTA, 카피 "시간을 지키는 가장 쉬운 방법" 유지. 404: 토큰만 반영.

### 2.5 문구 정리

| 현재 | 변경 |
|---|---|
| 사무실 아닌디?? | 근무지 반경 밖이에요 |
| 똑바로 선택해주셈! 알겠셈? | 휴가 날짜를 선택해 주세요 |
| 휴가일이 이상한디? | 종료일이 시작일보다 빨라요 |

### 2.6 범위 밖

- Live Activity 위젯 UI
- 알림 데이터 로직, 구성원 기능 추가
- 주간 근무시간 API/지표

---

## 검증

공통 게이트(모든 커밋 전): `npx tsc --noEmit`, `yarn lint`, `yarn prettier`(diff 없음), `npx jest`.

마이그레이션(57, 58 각각):

- `npx expo install --check`, `npx expo-doctor` (해결하지 못한 경고는 이 문서에 기록)
- `yarn ios` 빌드 후 스모크: 로그인 → 홈 Hero → 탭 전환 → 출퇴근 입력 진입 → 일정 → 더보기 > 테마 변경
- Live Activity: 시뮬레이터에서 시작 확인, 실기기 확인은 사용자에게 요청

UI:

- 화면마다 iOS 시뮬레이터 라이트/다크 스크린샷을 확정 목업과 비교
- 홈 Hero 5 상태 확인(miragejs mock 또는 렌더링 확인)
- 신규 테스트: `getHomeCta` 상태별 결과
- 접근성: 터치 영역 ≥ 44pt, 퍼플(`#7132f5`) 위 흰 텍스트 대비 ≥ 4.5:1, 아이콘 전용 버튼 `accessibilityLabel`
- Android: `yarn android` 실행과 3 탭 표시만 확인 (픽셀 검수는 iOS 기준)

## 커밋 계획 (`feature/ui-v3`)

1. `build: expo sdk 57 업그레이드`
2. `build: expo sdk 58 (beta) 업그레이드`
3. `refactor: NativeTabs import 경로를 expo-router/native-tabs 로 변경`
4. `docs: tech-stack 갱신`
5. `refactor: Kraken 디자인 토큰 및 공용 UI 컴포넌트 적용`
6. `feat: …` 화면 단위 (탭 구조, 홈, 출퇴근 시트, 일정, 휴가, 더보기/로그인)

push / PR(base `develop`)은 사용자 요청 시에만 진행한다.

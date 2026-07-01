# On Time — 프레임워크 업그레이드 · 모던 UI · 근무시간 LiveActivity 설계

- **작성일**: 2026-06-30
- **브랜치**: `feature/ui-v3-and-live-activity` (현재 브랜치에서 전부 작업)
- **참고**: `/Users/hwpark/Documents/rn-workspace/template-expo-app`, `docs/design/spotify-design.md`

## 목표

On Time(근태 앱)을 세 가지 축으로 업그레이드한다.

1. **프레임워크 최신화** — template-expo-app과 동일한 스택으로 정렬
2. **모던 UI** — Spotify Dark Immersive 방향(라이트+다크) 전체 리디자인
3. **근무시간 LiveActivity** — iOS 전용, 근무 시작/종료에 연동

세 작업은 순차 의존(① → ② → ③)이므로 **하나의 브랜치에서 3 phase**로 진행하며, 각 phase 종료 시 빌드/시뮬레이터 검증 후 커밋한다.

## 확정된 결정 사항

| 항목 | 결정 |
|---|---|
| 업그레이드 범위 | template와 **완전 동일** |
| UI 방향 | **A · Spotify Dark Immersive**, 라이트+다크 모두 |
| 하단 탭 | iOS = **NativeTabs**(`expo-router/unstable-native-tabs`), Android = JS Tabs |
| zustand 이전 범위 | **로그인·테마 상태만** 슬라이스로 이전, 기존 Provider 유지 |
| i18n | i18next 도입, **ko 우선**(en 스캐폴딩), 점진 이전 |
| LiveActivity 잠금화면 | **L2 · 진행 링 + 스탯** |
| 다이나믹 아일랜드 | Compact: 좌=남은시간 / 우=근무시간 |
| LiveActivity 통합 | **A · 커스텀 Expo config plugin + Swift(ActivityKit)** |
| 우선 화면 | **홈 · 출퇴근** 우선, 이후 전 화면 |

---

## Phase 1 — 프레임워크 업그레이드

**목표**: template와 동일 스택으로 정렬, iOS/Android 빌드 + 시뮬레이터 동작 + 기존 기능 무회귀.

### 1.1 SDK 마이그레이션 (`expo:upgrading-expo` 스킬 사용)

- Expo SDK 55 → 56, React Native 0.83.4 → 0.85.3, react/react-dom 19.2.0 → 19.2.3
- 모든 `expo-*` 패키지를 56 라인으로 정렬
- 핀 버전 정렬: `@shopify/flash-list` 2.0.2, reanimated 4.3.1, react-native-worklets 0.8.3, screens 4.25.2, safe-area-context 5.7.0, async-storage 2.2.0, svg 15.15.4, pager-view 8.0.1
- `npx expo install --fix` 후 `npx expo-doctor`로 호환성 확정

### 1.2 스타일 스택: NativeWind 4 → 5, Tailwind 3 → 4

- 의존성: `tailwindcss@4`, `@tailwindcss/postcss`, `postcss`, `react-native-css`, devDeps 정렬
- `resolutions`: `lightningcss` 1.30.1 추가
- `metro.config.js`: `withNativewind(config)` (소문자, `input` 인자 제거 — NW5 방식)
- `babel.config.js`: NativeWind 5 preset에 맞게 갱신
- `src/app/global.css`: NW5 형식으로 갱신
- `tailwind.config.js`: NW5/TW4 호환 + **디자인 토큰(색)** 정의 → Phase 2와 직접 연결

### 1.3 상태관리: zustand 도입

- `src/shared/store/rootStore.ts` 신설 — `create()(devtools(persist(immer(...))))`, AsyncStorage persist
- `src/shared/store/types.d.ts` — `SlicePattern` 타입
- **이전 대상**: 로그인 상태(isLoggedIn/userinfo), 테마 선호(light/dark/system)만 슬라이스로 이전
- **유지**: auth/theme/notification/query Provider는 로직·구독 레이어로 유지(template도 provider+store 공존). Provider 내부에서 store를 읽고 쓰도록 연결

### 1.4 신규 라이브러리

- `i18next` + `react-i18next` + `expo-localization` → `src/shared/i18n` (`locales/ko.json` 기본, `en.json` 스캐폴딩). 하드코딩 한국어 문자열은 Phase 2 화면 작업 시 동시 이전
- `expo-image`(이미지 최적화), `react-native-gesture-handler`, `expo-symbols`, `expo-glass-effect`(iOS 글래스 표면)

### 1.5 OS별 레이아웃 분기

- `src/app/(tabs)/_layout.ios.tsx` — NativeTabs(SF Symbols), `_layout.tsx` — Android JS Tabs
- 탭 구성은 현재 라우트(`(home)`, `schedule`, `todo`, `(more)`) 유지

### 1.6 툴링

- eslint/prettier config를 template 최신 RC(`@bob-park/eslint-config-bobpark`, `@bob-park/prettier-config-bobpark`)로, `eslint@9`, `expo lint` 스크립트 추가
- `packageManager` yarn 4.14.1로 정렬

### 검증 (Phase 1 완료 기준)

- iOS·Android 시뮬레이터 빌드 성공
- 로그인 → 출퇴근 → 네비게이션 무회귀 확인
- `expo-doctor` 통과 후 커밋

---

## Phase 2 — UI 리디자인 (방향 A · 라이트+다크)

**목표**: Spotify Dark Immersive 방향을 라이트/다크 모두로 전체 적용. 홈·출퇴근 우선.

### 2.1 디자인 토큰 (`tailwind.config.js` + ThemeProvider 클래스 토글)

| 역할 | 다크 | 라이트 |
|---|---|---|
| 배경 (base) | `#000000` | `#f7f7f8` |
| 표면 (surface) | `#181818` | `#ffffff` |
| 표면2 (elevated) | `#232323` | `#f0f0f2` |
| 보더 | `#282828` | `#e6e6ea` |
| 텍스트 | `#ffffff` | `#15171c` |
| 텍스트 약 | `rgba(255,255,255,.5)` | `#8a8f99` |
| 액센트(브랜드) | `#1ed760` | `#1ed760` |
| 위험/초과 | `#f3727f` | `#e0455a` |

- 원칙: 그린 단일 액센트(기능적, 장식 금지), pill 지오메트리(`rounded-full` 버튼), 큰 tabular-nums 숫자
- iOS는 `expo-glass-effect`로 탭바/모달 글래스, Android는 솔리드 surface

### 2.2 공용 컴포넌트 (`src/shared/components`)

- `Button` (pill: primary green / secondary surface / outline)
- `Card`(surface+border), `StatTile`, `Badge`/`StatusPill`, `ProgressBar`, `ProgressRing`(LiveActivity와 공유 개념), `SectionHeader`
- 기존 `motion/`(AnimatedPressable, entering) 재사용, 토큰만 교체

### 2.3 화면별 리디자인

**우선순위 1 (핵심)**
- **홈 `(home)/index`** — 히어로 work-state 카드(before/working/overtime/done)를 A 스타일로: 그린 액센트, 거대 남은시간(tabular-nums), pill CTA, 하단 stat 타일(이번주/연차). 기존 그라데이션 → 솔리드 surface + 그린 포인트
- **출퇴근 `(home)/attendance`** — 출/퇴근 입력, GPS 상태, 워크타입(OFFICE/OUTSIDE/HOME) 선택을 카드+pill로 재구성

**우선순위 2 (이후)**
- 연차 `(home)/dayoff/add`·`histories` — 폼/리스트 토큰, FlashList 정비
- `schedule`, `todo` — 리스트/캘린더 surface
- 알림 `(home)/notifications`·`(more)/notifications`
- 더보기 `(more)/index`·`theme` — 설정 row, 테마 3-way 선택
- `login`, `callback`, `+not-found` — 브랜드 로고 + 그린 CTA
- 탭바 — iOS NativeTabs / Android JS Tabs, 활성 그린

### 2.4 다크/라이트 토글

- `ThemeProvider`가 시스템 `userInterfaceStyle` + 사용자 선호(zustand persist) 반영
- NativeWind `dark:` 클래스 분기, 시스템/라이트/다크 3-way

### 2.5 작업 방식

- `docs/agents/workflows/design-workflow.md` 6단계 계약 준수: 추가 시각 검토 필요 시 임시 디렉토리 HTML 목업 + 로컬 서버 → 확정분만 `src/` 반영
- 화면별 시뮬레이터 확인

### 검증 (Phase 2 완료 기준)

- 홈·출퇴근 라이트/다크 모두 정상 렌더
- 전 화면 토큰 적용, 다크/라이트 토글 정상

---

## Phase 3 — 근무시간 LiveActivity (iOS 전용)

**목표**: 근무 시작 시 Live Activity 시작, 종료 시 종료. 잠금화면 L2 + 다이나믹 아일랜드.

### 3.1 네이티브 구성 (A안: 커스텀 config plugin)

- `src/modules/live-activity/` 로컬 Expo 모듈 + config plugin
- config plugin(prebuild 시): iOS 배포타깃 16.2+, Info.plist `NSSupportsLiveActivities=true`, **Widget Extension 타깃**(`OnTimeWidget`) 생성, App Group 설정
- Swift `ActivityAttributes`:
  - 정적(attributes): `clockInAt: Date`, `targetLeaveAt: Date`
  - 동적(content-state): `progress: Double` (선택; 시간은 네이티브 타이머 자동)

### 3.2 위젯 UI (SwiftUI / WidgetKit)

- **잠금화면 (L2 · 진행 링 + 스탯)**: 원형 진행 링 + 남은시간 큰 숫자(그린 `#1ed760`) + "근무 N · 목표 HH:mm", 블랙 배경
- **다이나믹 아일랜드**:
  - Compact leading = 남은시간 `4h12`(그린), trailing = 근무시간 `5h48`
  - Minimal = 남은시간만
  - Expanded = 남은시간 강조 + 근무시간 + 진행바
- **자동 카운트**: `Text(timerInterval:countsDown:)`로 푸시 없이 1초 단위 자동 갱신
  - 남은시간 = `targetLeaveAt`까지 카운트다운
  - 근무시간 = `clockInAt`부터 카운트업

### 3.3 JS 브릿지 (네이티브 모듈)

- `startWorkActivity({ clockInAt, targetLeaveAt })`
- `endWorkActivity()`
- `updateWorkActivity({ targetLeaveAt })` (목표 변경 시, 선택)
- iOS only 가드: `Platform.OS === 'ios'` + ActivityKit `areActivitiesEnabled` 체크. Android/웹은 no-op

### 3.4 앱 연동

- `src/domain/attendances/liveActivity.ts` 래퍼
- `useClockIn().onSuccess(data)` → `startWorkActivity({ clockInAt: data.clockInTime, targetLeaveAt: data.leaveWorkAt })`
- `useClockOut().onSuccess()` → `endWorkActivity()`
- 앱 시작 시 동기화: "근무 중(clockIn 있고 clockOut 없음)인데 Activity 없음" → 재시작, "근무 아님인데 Activity 있음" → 종료 (재설치/재부팅 대비)
- (선택) zustand에 현재 activityId 보관

### 3.5 빌드/검증

- Dev Client 필요(Expo Go 미지원): `expo prebuild` + `expo run:ios`
- 시나리오: 출근 → 잠금화면 L2 표시 → 다이나믹 아일랜드 compact/expanded 확인 → 퇴근 → Activity 종료
- 다이나믹 아일랜드는 iPhone 15+ 시뮬레이터에서 테스트

### 검증 (Phase 3 완료 기준)

- 출근 시 Live Activity 시작, 시간 자동 카운트
- 다이나믹 아일랜드 좌(남은)/우(근무) 표시
- 퇴근 시 종료, 동기화 로직 정상
- Android/웹에서 no-op(크래시 없음)

---

## 위험 요소 & 완화

| 위험 | 완화 |
|---|---|
| NativeWind 5는 preview | template가 동일 버전을 검증 사용 중. 문제 시 컴포넌트 단위로 격리 검증 |
| Tailwind 4 마이그레이션(config/색) | 토큰을 한 곳(`tailwind.config.js`)에 집약, Phase 1 종료 시 빌드 검증 |
| zustand 이전 회귀 | 범위를 로그인·테마로 한정, Provider는 유지하여 표면 변경 최소화 |
| Live Activity 네이티브 빌드 | Dev Client 전용임을 명시, prebuild 후 단계적 검증 |
| 우선순위 외 화면 누락 | Phase 2에서 전 화면 체크리스트로 추적 |

## 범위 밖 (YAGNI)

- 백엔드 푸시 기반 Live Activity 갱신(네이티브 타이머로 충분; 목표시간 변경은 `updateWorkActivity` 선택 사항)
- Android Live Activity 대응(요구사항 iOS 한정)
- en 번역 본문 작성(스캐폴딩만, ko 우선)
- 신규 기능 추가(리디자인·업그레이드·LiveActivity 외 기능 변경 없음)

## 단계별 산출물 / 커밋

1. Phase 1 — 업그레이드 완료, 빌드 통과 → 커밋
2. Phase 2 — 홈·출퇴근 우선 리디자인 → 나머지 화면 → 커밋
3. Phase 3 — LiveActivity 모듈 + 연동 → 커밋

# Live Activity 시스템 자동 갱신 전환 — 디자인 스펙

- 날짜: 2026-07-02
- 브랜치: `feature/modify-live-activity`
- 상태: 승인됨 (사용자 리뷰 완료 후 구현 계획 작성)

## 배경 / 동기

현재 `WorkLiveActivity`는 앱이 계산한 정적 문자열("H:MM", 분 단위)을 표시하고,
홈 화면의 foreground 분 단위 push로만 갱신된다. 따라서 **앱이 백그라운드에서
종료되면 Live Activity 시간이 멈춘다.**

이번 변경은 시간 텍스트와 progress bar를 **시스템(WidgetKit) 자동 갱신**으로
전환해 앱 프로세스가 죽어도 계속 흐르게 한다.

## 결정 사항 (Q&A 결과)

| 주제 | 결정 |
| --- | --- |
| 타이머 형식 | `Text`의 `date` + `dateStyle: 'relative'` (분 단위, "8시간 5분" 스타일). 초 단위 ticking(`timerInterval`)은 사용하지 않음 |
| Progress bar | `ProgressView`의 `timerInterval` + `countsDown: false`로 시스템 자동 진행 |
| 초과근무 | 기존 동작 유지 — 앱이 살아있으면 push로 라벨 "초과 근무" + 빨강 전환. relative 텍스트는 target 이후 자동 카운트업되므로 그 값이 곧 초과분 |
| Dynamic Island compact/minimal | **변경 없음** — 왼쪽 남은시간(초과 시 `+30m`/`+1h` 빨강), 오른쪽 근무시간, 짧은 정적 문자열(앱 push 갱신) |
| Dynamic Island expanded | 새 레이아웃 적용 (배너와 동일 구성) |

### 수용된 한계

- 숫자 "H:MM" 포맷의 시스템 자동 갱신 텍스트는 SwiftUI에 존재하지 않음 →
  relative 스타일("8시간 5분")로 대체.
- 앱이 죽은 채 퇴근 시각이 지나면 라벨이 "남은 시간"인 상태로 값이 다시
  증가한다 (초과근무 라벨/색 전환은 앱 push 필요).
- `relative`의 실제 렌더링 형식은 시스템 로케일을 따른다 (한국어 기기에서
  "8시간 5분" 예상, 구현 시 시뮬레이터로 확인).

## UI 디자인

### 잠금화면 / 알림 배너

```
남은 시간              근무 시간
8시간 5분              1시간 0분     ← 시스템 자동 갱신 (relative)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     ← ProgressView(timerInterval) 자동 진행
09:00 출근            퇴근 18:00    ← 정적 텍스트
```

- **남은 시간**: `Text date={new Date(targetLeaveAtMs)} dateStyle="relative"` —
  브랜드 그린(`#1ed760`) hero. "8시간 5분"이 기존 "8:05"보다 길므로
  `lineLimit(1)` + `minimumScaleFactor` 유지, 폰트 크기는 구현 시 조정 가능.
- **근무 시간**: `Text date={new Date(clockInAtMs)} dateStyle="relative"` —
  흰색, 우측 정렬.
- **Progress bar**: `ProgressView timerInterval={{lower: clockIn, upper:
  targetLeave}} countsDown={false}` — tint는 accent(평시 그린 / 초과 빨강).
  target 도달 후 가득 찬 상태 유지.
- **하단 좌**: `"09:00 출근"` — 출근 시각 라벨 (신규 `clockInLabel`).
- **하단 우**: `"퇴근 18:00"` — 기존 `targetLabel` 재활용, 라벨 문구 "목표" →
  "퇴근".

### 초과근무 상태 (앱이 push한 경우)

```
초과 근무              근무 시간
30분(빨강)             9시간 30분
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  (가득 참, 빨강)
09:00 출근            퇴근 18:00
```

- 라벨 "남은 시간" → "초과 근무", accent 그린 → 빨강(`#f3727f`).
- relative 텍스트는 자동으로 카운트업 중이므로 값 교체 불필요.

### Dynamic Island

- **compact**: 변경 없음. leading=남은시간 compact(초과 시 `+30m`/`+1h` 빨강),
  trailing=근무시간 compact.
- **minimal**: 변경 없음 (남은시간 compact).
- **expanded**: leading = "남은 시간"(또는 "초과 근무") 캡션 + relative hero /
  trailing = "근무 시간" 캡션 + relative / bottom = progress bar +
  `09:00 출근` · `퇴근 18:00`.

## 데이터 / 코드 변경

### `src/domain/attendances/liveActivity/types.ts` — `WorkActivityProps`

| 변경 | 항목 | 비고 |
| --- | --- | --- |
| 추가 | `clockInAtMs: number` | epoch ms. 위젯 함수 안에서 `new Date(ms)`로 변환 (props는 flat serializable 유지) |
| 추가 | `targetLeaveAtMs: number` | epoch ms |
| 추가 | `clockInLabel: string` | 출근 시각 "HH:mm" (예: "09:00") |
| 유지 | `remainingCompact`, `workedCompact` | Dynamic Island compact 용 |
| 유지 | `targetLabel`, `isOvertime` | |
| 제거 | `remainingLabel`, `workedLabel`, `progress` | 시스템 렌더링으로 대체 |
| 제거 | `clockInAt`, `targetLeaveAt` (ISO string) | `*Ms` number 필드로 대체 |

### `src/domain/attendances/liveActivity/computeProps.ts`

- `formatDuration` 제거 (배너용 H:MM 라벨 소멸).
- `formatCompact`, `formatClockTime`, `isOvertime`/compact 계산 유지.
- `clockInLabel = formatClockTime(clockInMs)` 추가.

### `src/domain/attendances/liveActivity/WorkLiveActivity.tsx`

- 배너/expanded 를 위 레이아웃으로 재작성.
- relative `Text`와 `timerInterval` `ProgressView` 사용. 기존 modifier 패턴
  (`font`, `foregroundStyle`, `monospacedDigit`, `lineLimit`,
  `minimumScaleFactor`, `tint`, `padding`) 유지.
- compact/minimal 영역은 기존 코드 그대로.

### 업데이트 흐름 (`index.ts`, 홈 화면) — 변경 없음

- `startWorkActivity` / `updateWorkActivity` / `endWorkActivity` /
  `syncWorkActivity` 구조 유지.
- 홈 화면 분 단위 foreground push 유지 — compact 문자열 갱신과 초과근무
  전환(라벨/색)에 여전히 필요.

### 테스트

- `computeWorkActivityProps` 관련 테스트를 새 props 형태로 갱신
  (`liveActivitySync.test.ts` 등 기존 테스트 파일).
- `WorkLiveActivity` 레이아웃 자체는 시뮬레이터에서 육안 검증:
  평시 / 초과근무 / 앱 강제 종료 후 자동 갱신 여부.

## 에러 처리

- 기존과 동일: Live Activity 호출 실패는 `console.error` 로깅 후 무시
  (앱 핵심 기능에 영향 없음). iOS 외 플랫폼 no-op 유지.
- `timerInterval`/`date` props는 iOS 16+ 전용 — 프로젝트 최소 지원 버전이
  이를 충족하는지 구현 시 확인 (Live Activity 자체가 iOS 16.1+).

## 범위 밖 (Out of scope)

- APNs push 를 통한 원격 Live Activity 갱신 (앱 죽은 상태의 초과근무 전환을
  완전히 해결하려면 서버 push 필요 — 이번 범위 아님).
- 홈 화면 UI 변경.

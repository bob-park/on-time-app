# Changelog

All notable changes to this project will be documented in this file.

## [1.0.6] - 2026-04-17

### Changed
- 전체 화면 레이아웃·간격 리듬 정돈: 상단 패딩 값 통일, 섹션 라벨 스타일 통합, 관련 요소는 촘촘히·섹션 간은 넉넉히 배치해 시각적 위계 강화
- 홈: 2×2 동일 카드 그리드 해체 → 자주 쓰는 휴가 바로가기 2개(primary 카드) + 나머지 2개(리스트 row)로 리듬 변화, 홈 헤더·Hero 이모지 제거
- 일정: 카드의 좌측 색상 스트라이프 제거(과사용 패턴), 좌측 아이콘 타일 tint로 휴가 타입 표현
- 출퇴근: 중앙 정렬 해제하고 좌측 정렬 기반으로 재배치, 고정폭 버튼을 flex 기반 전체 폭 CTA로 변경, 시간 정보 라벨·값 정렬 개선
- 휴가 내역: 총 사용일을 상단 hero 메트릭으로 승격(숫자가 주인공)
- 더보기: 섹션 헤더·프로필 카드 간격 정돈, 메뉴 그룹 gap 확대

### Added
- 모션 레이어: 전 화면 페이지 로드 staggered entering 애니메이션, AnimatedPressable(터치 시 scale 피드백), 홈 Hero 진행률 부드러운 전환 및 근무중 dot breathing pulse, 휴가 내역 총 사용일 count-up
- 공용 모션 프리미티브: `src/shared/components/motion/` (AnimatedPressable, entering presets)

### Fixed
- 테마 시스템: 시스템 모드 선택 시 다크 모드가 올바르게 적용되지 않던 문제 해결 (Context가 사용자 선택값을 그대로 노출하던 구조를 실제 표시되는 light/dark로 파생하도록 수정, NativeWind v4 API에 맞춰 setColorScheme 호출 교정)

## [1.0.5] - 2026-04-06

### Added
- Weekend hero card on home screen: shows "오늘은 주말이에요" message with gray gradient when it's Saturday or Sunday, while keeping the clock-in button accessible for weekend work
- Overtime done card: when clocking out after scheduled leave time, the done card shows a dark gradient with red accent, overtime duration, and clock-in/out times instead of the normal green card

## [1.0.4] - 2026-04-03

### Changed
- Full M3 (Material You) redesign for (more) tab: profile card, settings menu, theme picker, and notification preferences
- Dayoff add page: merged two separate leave info cards into one unified card with divider, replaced 6 repetitive toggle buttons with data-driven chip/pill components
- Dayoff histories page: M3 card style for vacation items, chip-based filter replacing SelectedButton component
- Notifications page (home): M3 card surfaces with icon containers and proper dark mode shadows
- Header pattern unified across all subpages: center title + left back button using Icon component
- Android tab bar now has explicit background color for dark mode consistency
- (more) layout padding reduced from 24px to 16px for better content density

### Added
- CLAUDE.md with gstack skill routing rules

### Removed
- Magical conch feature (tab, sound assets, and all references)
- Legacy icon imports (Entypo, MaterialCommunityIcons, MaterialIcons) replaced by unified Icon component

## [1.0.3] - 2026-04-02

### Changed
- Schedule page redesigned with Material You (M3) design language: rounded surfaces, vacation-type color coding (violet/amber/teal), week calendar strip with swipe indicator
- Home page remaining time format updated from `00h 00m` to `00:00`
- Home page "Active Shift" indicator now shows Korean text and pulse animation
- Vacation type dots on calendar days now show per-type colors instead of a single generic dot
- Colleague schedule list replaced FlashList-inside-ScrollView with plain rendering for better performance
- Vacation data query now covers all 3 visible weeks instead of only the current week
- "Today" button resets to fresh date instead of using stale module-level constant

### Added
- ScheduleEmptyState component for empty schedule days
- ScheduleSkeleton loading states for both personal and colleague schedules
- Vacation color constants (VACATION_COLORS) as shared design tokens
- Loading state indicators with count badges

### Fixed
- Badge class dual-application issue where bg/text classes were incorrectly shared between View and Text
- Vacation subtype display now correctly handles unknown subtypes instead of defaulting to PM
- Touch target on week day items expanded to meet 44px accessibility minimum
- Removed unused FlashList import, ThemeContext import, and empty useEffect

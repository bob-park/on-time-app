# Changelog

All notable changes to this project will be documented in this file.

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

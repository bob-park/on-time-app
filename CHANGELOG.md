# Changelog

All notable changes to this project will be documented in this file.

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

# QA Report: on-time-app

**Date:** 2026-04-01
**Branch:** feature/new-ui-v3
**Base:** master
**Mode:** Diff-aware (code review, React Native app)
**Duration:** ~3 min
**Files changed:** 11 (vs master)

---

## Summary

| Metric | Value |
|--------|-------|
| Issues found | 3 |
| Fixed | 1 (verified) |
| Deferred | 2 |
| TypeScript errors | 0 |

---

## Issues

### ISSUE-001 — "할일 추가" button is a dead button
- **Severity:** Medium
- **Category:** Functional
- **File:** `src/app/(tabs)/todo.tsx:28`
- **Status:** Deferred
- **Description:** The "할일 추가" Pressable in the todo empty state has no `onPress` handler. User taps it and nothing happens.
- **Why deferred:** No todo creation screen exists yet. This needs a new feature, not just a wiring fix.

### ISSUE-002 — "근무 확인" and "내 정보" action cards are dead
- **Severity:** Medium
- **Category:** Functional
- **File:** `src/app/(tabs)/(home)/index.tsx:410-416`
- **Status:** Deferred
- **Description:** Two of the four ActionCards in the home tab 2x2 grid ("근무 확인", "내 정보") have no `onPress`. Users tap and get no feedback.
- **Why deferred:** No target screens exist for these cards yet.

### ISSUE-003 — Typo `sise-full` in more tab layout
- **Severity:** Low
- **Category:** Visual
- **File:** `src/app/(tabs)/(more)/index.tsx:86`
- **Status:** Verified
- **Commit:** c2c0bd3
- **Description:** `className="sise-full mt-4"` should be `size-full`. NativeWind ignores `sise-full`, so the menu container didn't get `width: 100%; height: 100%`.
- **Note:** Pre-existing bug, not introduced by this branch. Fixed anyway.

---

## Code Review Notes

### What looks good
- **Pull-to-refresh** on home tab: properly uses `RefreshControl` with async `reloadToday()` and loading state. Clean implementation.
- **Work state machine** (`getWorkState`): clear, correct logic for before/working/overtime/done states.
- **Icon component**: clean SF Symbol wrapper with emoji fallback. Correct try/catch for optional `expo-symbols` dependency.
- **NativeTabs migration**: proper Expo 55 compound component API. Labels and icons correctly structured.
- **Schedule tab**: `onPageScrollStateChanged` with `setPageWithoutAnimation(1)` infinite carousel pattern is correct.

### Minor observations (not bugs)
- `HeroWorking` progress `useMemo` depends on dayjs objects that are new references each render, so the memo doesn't cache effectively. Not a crash, just a no-op memo. The 1s interval timer makes it moot anyway.
- `home/index.tsx` header hardcodes "09:00 출근" in `HeroBeforeWork`. May not match users with different schedules.
- Two extra blank lines at `more/index.tsx:16`. Cosmetic only.

---

## Health Score

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 100 | TypeScript clean |
| Functional | 20% | 75 | 2 dead buttons (deferred) |
| Visual | 10% | 95 | 1 typo fixed |
| UX | 15% | 90 | Dead buttons reduce trust |
| Content | 5% | 100 | — |
| Performance | 10% | 100 | — |
| Accessibility | 15% | 100 | — |
| Links/Nav | 10% | 100 | — |

**Health Score: 93/100**

---

> QA found 3 issues, fixed 1, health score 93/100. 2 deferred (need new screens).

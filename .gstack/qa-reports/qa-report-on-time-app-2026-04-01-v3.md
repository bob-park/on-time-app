# QA Report: on-time-app (v3, Platform-conditional Tabs)

**Date:** 2026-04-01
**Branch:** feature/new-ui-v3
**Base:** master
**Mode:** Diff-aware (code review, React Native app)
**Focus:** Platform-conditional tab layout (commit 1932d89)

---

## Summary

| Metric | Value |
|--------|-------|
| Issues found | 0 new |
| Fixed | 0 |
| Deferred (from prior QA) | 2 |
| TypeScript errors | 0 |

---

## Platform-Conditional Tabs Review

### What was added
- `IOSTabs` component: preserves original `NativeTabs` from `expo-router/unstable-native-tabs` with SF Symbols
- `AndroidTabs` component: new `Tabs` from `expo-router` with `Ionicons` for icon rendering
- `Platform.OS === 'ios'` branch in `TabLayout` to select the correct component at runtime

### What looks good
- **Tab parity**: Both components define the same 4 tabs in the same order: (home), schedule, todo, (more). Labels match exactly: 오늘, 일정, 할일, 더보기.
- **Icon mapping is sensible**: SF Symbol → Ionicons mapping is reasonable (menubar.rectangle → grid, calendar → calendar, checkmark.circle → checkmark-circle, circle.grid.2x2 → apps). Focused/unfocused variants handled correctly.
- **Dark mode**: Android tabs use `tabBarActiveTintColor`/`tabBarInactiveTintColor` derived from theme. iOS retains `iconColor` prop. Both handle light/dark.
- **headerShown: false** on Android `Tabs` screenOptions. Correct, child layouts manage their own headers.
- **Font size**: Both use `fontSize: 10` for tab labels. iOS additionally bolds selected labels (`fontWeight: '900'`). Android doesn't have this, which is fine since the standard `Tabs` component handles active styling through tint color.
- **backBehavior: "history"** preserved on both paths.
- **TypeScript**: Clean. `{ theme: string }` prop type on both components is correct.
- **NativeTabs import preserved**: Tree-shaking at the bundler level means the NativeTabs code won't bloat the Android bundle if the bundler supports dead code elimination based on `Platform.OS`. For Metro bundler with React Native, `Platform.OS` checks are constant-folded at build time, so the unused branch gets stripped.

### No issues found
The platform branching is clean and correct.

---

## Prior Deferred Issues (from earlier QA runs)

- **ISSUE-001**: "할일 추가" button no onPress (`todo.tsx:28`) — needs new screen
- **ISSUE-002**: "근무 확인" / "내 정보" action cards no onPress (`home/index.tsx:506-516`) — needs new screens

---

## Health Score: 95/100

(Unchanged from v2. Platform branching is a structural improvement, no visual/functional change to score.)

> QA found 0 new issues. Platform-conditional tabs implementation is clean. Health score 95/100.

# QA Report: on-time-app (v2, skeleton UI)

**Date:** 2026-04-01
**Branch:** feature/new-ui-v3
**Base:** master
**Mode:** Diff-aware (code review, React Native app)
**Focus:** Skeleton UI addition (commit 7f8f250)

---

## Summary

| Metric | Value |
|--------|-------|
| Issues found | 0 new |
| Fixed | 0 |
| Deferred (from prior QA) | 2 |
| TypeScript errors | 0 |

---

## Skeleton UI Review

### What was added
- `SkeletonBlock` component: reusable shimmer block with `Animated.Value` opacity pulse (0.3 -> 1, 800ms cycle)
- `HeroSkeleton`: matches hero card layout (badge, text lines, stats, CTA button shape)
- `ActionCardSkeleton`: matches action card layout (icon, label, sub-text)
- Condition: `isLoading && !today` shows skeletons only on initial load, not during pull-to-refresh

### What looks good
- **Animation cleanup**: `return () => animation.stop()` in useEffect prevents leaks
- **Stable ref**: `useRef(new Animated.Value(0.3)).current` prevents re-creation on re-render
- **Dark mode**: `bg-gray-200 dark:bg-gray-700` on blocks, `bg-gray-100 dark:bg-gray-800` on container. Good contrast both themes.
- **Type safety**: `width: number | \`${number}%\`` correctly handles both `80` and `"100%"`
- **No skeleton flash on refresh**: `isLoading && !today` means pull-to-refresh keeps showing real data
- **useNativeDriver: true** on all animations. Good for perf.

### No issues found
The skeleton UI implementation is clean.

---

## Prior Deferred Issues (from earlier QA run)

- **ISSUE-001**: "할일 추가" button no onPress (`todo.tsx:28`) - needs new screen
- **ISSUE-002**: "근무 확인" / "내 정보" action cards no onPress (`home/index.tsx:506-516`) - needs new screens

---

## Health Score: 95/100

(+2 from prior 93, skeleton UI improves perceived loading UX)

> QA found 0 new issues. Skeleton UI implementation is clean. Health score 95/100.

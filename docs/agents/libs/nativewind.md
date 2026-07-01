---
title: NativeWind / Styling
scope: src/**/*.tsx
applies_to: styling components, dark mode
related:
  - ../conventions/react-sections.md
---

# NativeWind / Styling

> NativeWind utility class(`className`) 우선, `StyleSheet.create` 는 표현 불가할 때만. dark mode 는 `dark:` prefix(ThemeProvider 가 scheme 토글). 색/토큰은 Tailwind config 에서, JSX 에 hex 하드코딩 금지(프로토타이핑 제외).

- NativeWind utility class 를 사용한다; utility 로 표현할 수 없을 때만 `StyleSheet.create` 를 쓴다.
- Dark mode 는 `dark:` prefix 로 적용한다 (`ThemeProvider` 가 scheme 을 토글).
- token / color 는 Tailwind config 에서 가져온다; 프로토타이핑이 아닌 한 JSX 에 hex 를 하드코딩하지 않는다.

조건부 class 패턴과 dark mode 예시는 [React Components](../conventions/react-sections.md) 의 "Screen components" 섹션을 참조한다.

---
title: File & Identifier Naming
scope: src/**
applies_to: creating any new file, naming identifiers
related:
  - ./typescript.md
  - ./react-sections.md
  - ../structure.md
---

# File & Identifier Naming

> 모듈 파일 camelCase, 컴포넌트 PascalCase, DTO `<name>.dto.ts`, hook `useXxx`, 함수 camelCase 동사-우선, 상수 UPPER_SNAKE_CASE, route group `(group)`. 도메인/비즈니스 라벨(한국어 UI 텍스트)은 한국어.

## Naming table

| Kind                 | Convention                | Example                                   |
| -------------------- | ------------------------- | ----------------------------------------- |
| File (module)        | camelCase                 | `userNotification.ts`                     |
| File (component)     | PascalCase                | `AuthProvider.tsx`, `Loading.tsx`         |
| DTO file             | `<name>.dto.ts`           | `users.dto.ts`                            |
| Type / Interface     | PascalCase                | `UserDetail`, `PagedModel`                |
| Function             | camelCase, verb-first     | `getUserDetail`, `createUserNotification` |
| React hook           | `use` + PascalCase noun   | `useUserNotifications`                    |
| Constant             | UPPER_SNAKE_CASE          | `KEY_ACCESS_TOKEN`                        |
| Route folder (group) | `(group)` per expo-router | `(tabs)`, `(home)`                        |

## 한국어 라벨

도메인/비즈니스 라벨(user-visible 한국어 텍스트, UI 상수)은 한국어로 작성한다:

```ts
const THEME_OPTIONS = [
  { key: 'light', label: '밝은 모드' },
  { key: 'dark', label: '어두운 모드' },
  { key: 'system', label: '시스템 설정과 같이' },
];
```

## DTO 파일

- 도메인당 한 파일: `<domain>.dto.ts` (예: `users.dto.ts`).
- shape / 타입 정의 규칙은 [TypeScript](./typescript.md) 를 참조한다.

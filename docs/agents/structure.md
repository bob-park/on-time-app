---
title: Directory Structure & Placement Rules
scope: src/**
applies_to: adding a new domain, placing screens/components, route groups
related:
  - ./conventions/naming.md
  - ./conventions/module-aliases.md
  - ./libs/zustand-slice.md
---

# Directory Structure & Placement Rules

> `src/` 는 `app/`(expo-router 라우트), `domain/<name>/{apis,queries,store}`, `shared/`, `utils/` 로 나뉜다. 라우트/스크린은 `src/app/` 에만, 도메인 전역 상태는 `src/domain/<name>/store/`, cross-domain 코드는 `src/shared/`, 프레임워크 의존 없는 순수 헬퍼는 `src/utils/`.

## Directory tree

```text
src/
├── app/                 # expo-router routes (file-based). Screen components only.
│   ├── _layout.tsx              # Root layout (Providers + route guard)
│   ├── login.tsx                # OAuth login screen
│   ├── callback.tsx             # OAuth callback handler
│   ├── +not-found.tsx           # 404
│   ├── global.css               # Tailwind globals
│   └── (tabs)/                  # Tab navigation group
├── domain/              # business/도메인 modules. One folder per domain.
│   └── <name>/
│       ├── apis/                # HTTP calls + DTOs (`*.ts` + `*.dto.ts`)
│       ├── queries/             # react-query hooks (`*.tsx`)
│       └── store/              # Zustand slice (사용 시에만)
│           ├── slice.ts             # createXxxSlice — SlicePattern<T, BoundState>
│           └── <name>.state.ts      # 도메인 state 타입 정의
├── shared/              # cross-domain shared modules
│   ├── api/                     # ky client + auth header + paging helpers
│   ├── providers/               # Context providers (Auth, I18n, Notification, Theme, RQ)
│   ├── loaders/                 # app loader (Lottie splash)
│   ├── components/              # cross-domain reusable components
│   ├── dayjs/                   # dayjs setup (ko locale, plugins)
│   ├── i18n/                    # i18next setup + locales (ko, en)
│   ├── store/                   # Zustand root store + type helpers
│   │   ├── rootStore.ts             # useStore (devtools + persist + immer)
│   │   └── index.ts               # SlicePattern<T,S> declare module 'zustand'
│   └── queries/                 # shared query type defs
└── utils/               # pure utilities (no React/Expo deps)
```

## Placement rules

- A new business domain → new folder under `src/domain/<name>/`.
- Cross-domain reusable code → `src/shared/`.
- Pure helpers with no framework deps → `src/utils/`.
- Routes/screens go **only** in `src/app/`.
- 도메인 전역 상태 → `src/domain/<name>/store/`. 루트 조합/미들웨어 설정 → `src/shared/store/`.

## Routing (expo-router)

- `src/app/` 의 파일 트리가 곧 라우트다 (file-based). 파일은 screen 컴포넌트만 둔다.
- `_layout.tsx` = 해당 segment 의 레이아웃(루트는 Providers + route guard).
- `(tabs)` 처럼 괄호로 감싼 폴더는 route group 으로 URL 에 segment 를 추가하지 않고 그룹의 레이아웃/탭만 묶는다.
- `+not-found.tsx` 는 404, `callback.tsx` 는 OAuth 콜백 핸들러.

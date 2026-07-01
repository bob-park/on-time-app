---
title: Zustand Slice Pattern
scope: src/domain/*/store/**, src/shared/store/**
applies_to: declaring or modifying a Zustand slice / store action
related:
  - ../structure.md
  - ../conventions/react-sections.md
---

# Zustand Slice Pattern

> 도메인 전역 상태는 `SlicePattern<TSlice, BoundState>` slice 로 만들고 `rootStore.ts` 에서 spread 합성. 모든 `set` 은 devtools action 명시(`set(updater, false, { type: 'domain/action' })`). 셀렉터는 속성 단위만(객체 분해 금지). persist 는 비-민감 정보만, 토큰은 expo-secure-store.

## Rules

- 도메인 전역 상태는 zustand slice 로 관리한다.
- File layout:
  - `src/domain/<name>/store/<name>.state.ts` — slice 의 state + action 타입.
  - `src/domain/<name>/store/slice.ts` — `createXxxSlice` (default export).
  - `src/shared/store/rootStore.ts` — `useStore` (devtools + persist + immer).
  - `src/shared/store/index.ts` — `SlicePattern<T,S>` 헬퍼 (immer + devtools middleware baked-in).
- State 타입은 파일 맨 아래 `export type { ... }` 로 노출한다.
- Slice 함수 시그니처는 `SlicePattern<TSlice, BoundState>`. middleware 타입을 매번 다시 쓰지 않도록 헬퍼를 사용한다.
- 모든 `set` 호출은 devtools action name 을 명시한다: `set(updater, false, { type: '<domain>/<action>' })`. 예: `user/loggedIn`, `user/loggedOut`. action 이름은 도메인 prefix + camelCase 동작명.
- 루트 store 는 모든 slice 를 spread 합성하고 `BoundState` 는 각 slice state 의 intersection (`UserState & FooState`) 이다.
- 셀렉터는 **속성 단위로만** 작성한다. 객체 분해 셀렉터는 사용하지 않는다.

```tsx
// OK
const userinfo = useStore((s) => s.userinfo);
const isLoggedIn = useStore((s) => s.isLoggedIn);
const loggedIn = useStore((s) => s.loggedIn);

// 금지 — store 가 바뀔 때마다 re-render 됨
const { userinfo, isLoggedIn } = useStore();
```

- [section comment](../conventions/react-sections.md) 순서에서 `// store` 블록 안에 한 번에 모은다 (`// context` 다음, `// hooks` 앞).

## When to use

| Need                                               | Use                                                           |
| -------------------------------------------------- | ------------------------------------------------------------- |
| Single-component, transient state                  | `useState`                                                    |
| Provider-injected dependency tree                  | `Context` ([providers](./providers.md))                       |
| 여러 화면/도메인이 공유하는 일관된 클라이언트 상태 | zustand slice                                                 |
| 서버 데이터                                        | React Query ([ky-react-query](./ky-react-query.md)) — zustand 에 서버 응답을 미러링하지 않는다 |

`AuthProvider` 처럼 같은 컴포넌트 안에서 `useState` 와 `useStore` 를 섞어 쓰는 것은 허용된다. 화면 외부와 통신하지 않는 transient 값(token timer 등)은 `useState` 에, 여러 곳에서 읽히는 `userinfo` / `isLoggedIn` 은 store 에 둔다.

## Persist 규칙

- `persist` 는 비-민감 정보(UI 설정, 캐시된 메타데이터 등) 에만 적용한다.
- 토큰, refresh token, 기타 secret 은 `expo-secure-store` 에 보관하고 zustand store 에는 평문으로 보관하지 않는다.
- 현재 `rootStore.ts` 는 `partialize` 없이 store 전체를 persist 한다. 새 필드를 slice 에 추가할 때 민감성을 검토하고, 일부만 persist 해야 한다면 `partialize` 로 화이트리스트 한다.
- storage name 은 앱 식별자 (`template-expo-app`) 를 유지한다.

## Examples

State 파일:

```ts
// src/domain/users/store/users.state.ts
import { UserInfo } from '@/shared/providers/auth/AuthProvider';

type UserState = {
  userinfo?: UserInfo;
  isLoggedIn: boolean;
  loggedIn: (userinfo: UserInfo) => void;
  loggedOut: () => void;
};

export type { UserState };
```

Slice 파일:

```ts
// src/domain/users/store/slice.ts
import { SlicePattern } from 'zustand';

import { BoundState } from '@/shared/store/rootStore';
import { UserState } from './users.state';

const createUserSlice: SlicePattern<UserState, BoundState> = (set) => ({
  isLoggedIn: false,
  loggedIn: (userinfo) => set(() => ({ userinfo, isLoggedIn: true }), false, { type: 'user/loggedIn' }),
  loggedOut: () =>
    set(() => ({ userinfo: undefined, isLoggedIn: false }), false, {
      type: 'user/loggedOut',
    }),
});

export default createUserSlice;
```

루트 store:

```ts
// src/shared/store/rootStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
      })),
      { name: 'template-expo-app', storage: createJSONStorage(() => AsyncStorage) },
    ),
    { name: 'template-expo-app', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState;
```

소비자 (셀렉터만 발췌):

```tsx
// store
const userinfo = useStore((s) => s.userinfo);
const isLoggedIn = useStore((s) => s.isLoggedIn);
const loggedIn = useStore((s) => s.loggedIn);
const loggedOut = useStore((s) => s.loggedOut);
```

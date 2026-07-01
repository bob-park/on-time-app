---
title: TypeScript
scope: src/**/*.{ts,tsx}
applies_to: type declarations, component props, DTOs
related:
  - ./naming.md
  - ../libs/ky-react-query.md
---

# TypeScript

> `strict: true` 고정. 객체 shape 는 `interface`, union/alias 는 `type`. 컴포넌트 props 는 `Readonly<{...}>`. 타입은 파일 하단 `export type { ... }` 블록으로 re-export.

- `strict: true` is mandatory; `tsconfig.json` 을 약화시키지 않는다.
- 객체 shape 는 `interface`, union/alias 는 `type` 을 선호한다.
- 컴포넌트 props 는 `Readonly<{...}>` 로 감싼다.
- 타입은 파일 하단에서 `export type { ... }` 로 re-export 한다:

```ts
interface UserDetail {
  /* ... */
}
interface UserRoleDetail {
  /* ... */
}

export type { UserDetail, UserRoleDetail };
```

## DTO shape

DTO 파일(`<domain>.dto.ts`)은 각 shape 를 `interface`(union 은 `type`)로 정의하고 하단에서 한꺼번에 export 한다:

```ts
// src/domain/users/apis/users.dto.ts
import { UserRole } from '@/shared/providers/auth/AuthProvider';

interface UserRoleDetail {
  id: string;
  type: UserRole;
  description?: string;
}

interface UserDetail {
  id: string;
  userId: string;
  username: string;
  role: UserRoleDetail;
  email?: string;
}

export type { UserDetail, UserRoleDetail };
```

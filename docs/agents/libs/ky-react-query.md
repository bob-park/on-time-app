---
title: ky + React Query
scope: src/domain/*/apis/**, src/domain/*/queries/**, src/shared/api/**
applies_to: HTTP requests, query/mutation hooks
related:
  - ../structure.md
  - ../conventions/typescript.md
  - ../conventions/naming.md
---

# ky + React Query

> API 모듈은 공유 `api`(ky) + `generateAuthHeader(accessToken)`, 엔드포인트당 `async` 함수 하나, `.json<DTO>()` 반환. Query hook 은 `use<Action><Noun>`, query key `[resource, id, subresource, action?]`, mutation 은 `QueryMutationHandle<T>` 받고 action-named 키 반환.

## API module — `domain/<name>/apis/*.ts`

- 공유 `ky` client 를 `@/shared/api` 에서 `api` 로 import 한다.
- 인증 호출은 `generateAuthHeader(accessToken)` 를 사용한다.
- 엔드포인트당 exported `async` 함수 하나, action-verb 이름 (`get*`, `create*`, `update*`, `delete*`).
- 파라미터: positional path param 먼저, 그 다음 body / auth header 를 위한 단일 객체.
- `.json<DTO>()` 를 반환한다 — raw `Response` 를 노출하지 않는다.

```ts
// src/domain/users/apis/users.ts
import { UserDetail } from '@/domain/users/apis/users.dto';
import api, { generateAuthHeader } from '@/shared/api';
import type { AuthRequestHeader } from '@/shared/api/common.dto';

export async function getUserDetail(id: string, { accessToken }: AuthRequestHeader) {
  return api.get(`api/v1/users/${id}`, { headers: generateAuthHeader(accessToken) }).json<UserDetail>();
}
```

## React Query hook — `domain/<name>/queries/*.tsx`

- 파일 확장자는 `.tsx` (기존 convention).
- Hook 이름: `use<Action><Noun>` (예: `useUserNotifications`, `useUpdateUserNotification`).
- Query key shape: `[<resource>, <id>, <subresource>, <action?>]`, 예: `['users', userUniqueId, 'notifications', 'providers']`.
- Mutation hook 은 두 번째 인자 `{ onSuccess, onError }: QueryMutationHandle<T>` 를 받는다 (shared type: `src/shared/queries/index.ts`).
- `mutate`/`isPending` 을 action-named 키로 rename 한 객체를 반환한다.

```tsx
// src/domain/notifications/queries/userNotification.tsx
export function useUserNotifications({ userUniqueId }: { userUniqueId?: string }) {
  const { data, isLoading } = useQuery<UserNotificationProvider[]>({
    queryKey: ['users', userUniqueId, 'notifications', 'providers'],
    queryFn: () => getUserNotifications({ userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
  });

  return { notificationProviders: data || [], isLoading };
}
```

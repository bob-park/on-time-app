---
title: Module & Path Aliases / Import Order
scope: src/**/*.{ts,tsx}
applies_to: import statements across folders
related:
  - ./naming.md
  - ../structure.md
---

# Module & Path Aliases / Import Order

> Cross-folder import 는 `@/*`(→`src/*`), `@/assets/*`(→`assets/*`) alias, same-folder 는 상대경로. import 는 5그룹으로 빈 줄 구분: React → react-native/expo → 3rd-party → `@/` 내부 → side-effect.

## Path aliases

- `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- 같은 폴더 내 import 는 상대경로를 사용한다.

## Import order

그룹 사이에 빈 줄을 넣어 아래 순서로 묶는다:

1. React / `react`
2. `react-native`, `expo-*`
3. Third-party libs (`@tanstack/react-query`, `ky`, `classnames`, `dayjs`, …)
4. Internal `@/` imports
5. Side-effect imports (`'./global.css'`)

예시 (`src/shared/providers/auth/AuthProvider.tsx`):

```ts
import { createContext, useEffect, useMemo, useState } from 'react';

import { fetchUserInfoAsync, makeRedirectUri, refreshAsync } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { useQueryClient } from '@tanstack/react-query';

import { deleteUserNotificationProvider } from '@/domain/notifications/apis/userNotification';
import dayjs from '@/shared/dayjs';
import delay from '@/utils/delay';
```

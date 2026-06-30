---
title: React Components, Comments & Section Comments
scope: src/**/*.tsx
applies_to: screen components, custom hooks (useXxx.tsx), shared providers
related:
  - ./naming.md
  - ../libs/zustand-slice.md
  - ../libs/nativewind.md
---

# React Components, Comments & Section Comments

> 컴포넌트/커스텀 hook/shared provider 함수 본문은 11개 고정 순서 섹션 주석으로 구분한다. 사용 안 하는 섹션은 생략(빈 헤더 금지). 기본은 주석 없음 — 식별자 이름이 의미를 담는다. 도메인 라벨은 한국어.

## Comments

- Default: write none. 식별자 이름이 의미를 담는다.
- Permitted: 아래 section marker, 그리고 non-obvious 비지니스 reasoning 에 대한 한 줄 한국어 주석.
- Never narrate WHAT the code does.

## Section comment order

함수 본문은 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는 섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand 셀렉터 (`useStore((s) => s.x)`) — 속성 단위 셀렉터만 사용, 객체 분해 셀렉터 금지 (사용 시에만)
5. `// hooks` — 그 외 커스텀 hook 호출 (`useRouter`, `useColorScheme` 등)
6. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
7. `// useEffect`
8. `// useLayoutEffect`
9. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수
10. `// memorize` — `useMemo`
11. `// callback` — `useCallback`

같은 섹션 안에서는 여러 줄을 자유롭게 작성한다. 같은 파일에 co-locate 된 sub-component (예: `UserList.tsx` 의 `UserItem`) 도 동일 규칙을 따른다.

## Standard example

```tsx
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { View } from 'react-native';

import { useColorScheme } from 'nativewind';

import { useContents } from '@/domain/contents/queries/contents';
import { ContentsContext } from '@/shared/providers/contents/ContentsProvider';

export default function Contents() {
  // ref
  const containerRef = useRef<View>(null);

  // context
  const { contents } = useContext(ContentsContext);

  // state
  const [open, setOpen] = useState<boolean>(false);

  // hooks
  const { colorScheme } = useColorScheme();

  // queries
  const { list, isLoading } = useContents({ size: 10, page: 0 });

  // useEffect
  useEffect(() => {
    // ...
  }, [open]);

  // handle
  const handleClick = () => {
    // ...
  };

  // memorize
  const memoized = useMemo(() => heavy(list), [list]);

  // callback
  const handleSelect = useCallback((id: string) => {
    // ...
  }, []);

  return <View>...</View>;
}
```

## Screen components (`src/app/**`)

- route file 당 `default export` (expo-router requirement).
- NativeWind `className` 으로 스타일링.
- 조건부 class 는 `classnames` (`import cx from 'classnames'`).
- user-visible 한국어 라벨은 한국어, code identifier 는 영어.
- 섹션 주석은 위 순서를 따른다.

```tsx
<TouchableOpacity
  className={cx('flex flex-row items-center gap-3 px-4 py-4', {
    'bg-black dark:bg-white': theme === option.key,
  })}
  onPress={() => onUpdateTheme(option.key as ThemePreference)}
>
  <Text className="flex-1 text-[15px] font-semibold">{option.label}</Text>
</TouchableOpacity>
```

## Migration policy

기존 파일은 일괄 마이그레이션하지 않는다. 해당 파일을 다른 작업으로 수정할 때 같은 PR 안에서 점진적으로 정리한다.

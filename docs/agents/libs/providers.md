---
title: Context Provider Pattern
scope: src/shared/providers/**
applies_to: creating or modifying a Context provider
related:
  - ../conventions/react-sections.md
  - ./zustand-slice.md
---

# Context Provider Pattern

> Provider 컴포넌트는 `default export`, `Context` 와 public 타입은 named export. 함수 본문은 [section comment](../conventions/react-sections.md) 순서를 따르고 context value 는 `useMemo` 로 감싼다. 앱의 provider: Auth, I18n, Notification, Theme, RQ (`src/shared/providers/`).

## Rules

- `default export` 는 Provider 컴포넌트.
- `Context` 와 public 타입은 named export 한다.
- 컴포넌트 안의 블록은 [section comment](../conventions/react-sections.md) 순서로 구분한다.
- context value 는 `useMemo` 로 감싼다.

```tsx
export const FooContext = createContext<FooContextProps>({
  /* defaults */
});

export default function FooProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [value, setValue] = useState<string>('');

  // useEffect
  useEffect(() => {
    /* ... */
  }, []);

  // handle
  const handleChange = (next: string) => setValue(next);

  // memorize
  const memorizeValue = useMemo<FooContextProps>(() => ({ value, onChange: handleChange }), [value]);

  return <FooContext value={memorizeValue}>{children}</FooContext>;
}
```

## Context vs store

화면 외부와 통신하지 않는 의존성 주입 트리는 Context, 여러 화면/도메인이 공유하는 일관된 클라이언트 상태는 [zustand slice](./zustand-slice.md) 를 사용한다. 서버 데이터는 store 에 미러링하지 않고 React Query 로 관리한다.

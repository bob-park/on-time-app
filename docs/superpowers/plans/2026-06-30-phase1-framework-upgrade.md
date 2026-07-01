# Phase 1 — 프레임워크 업그레이드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On Time 앱을 template-expo-app과 동일한 스택(Expo 56 / RN 0.85 / NativeWind 5 + Tailwind 4 / zustand / i18next)으로 정렬하고, iOS·Android 빌드와 기존 기능 무회귀를 확인한다.

**Architecture:** Expo SDK 55→56 업그레이드 후 스타일 스택(NativeWind 5/Tailwind 4)을 마이그레이션하고, 상태관리에 zustand(persist+immer)를 도입하되 로그인·테마 상태만 슬라이스로 이전한다. 기존 Context Provider는 로직 레이어로 유지하고 내부에서 store를 읽고 쓴다. i18next는 ko 기본으로 도입하고 점진 이전한다.

**Tech Stack:** Expo SDK 56, React Native 0.85.3, NativeWind 5 + Tailwind 4, zustand 5 + immer + persist, i18next + react-i18next + expo-localization, expo-image, react-native-gesture-handler, expo-symbols, expo-glass-effect, ESLint 9.

## Global Constraints

- 작업 브랜치: `feature/ui-v3-and-live-activity` (현재 브랜치). 새 브랜치 생성 금지.
- secret 파일 변경/커밋 금지: `.env`, `.env.local`, `google-services.json`, `GoogleService-Info.plist`.
- `git push --force`, `git reset --hard`, `git branch -D` 금지. master/develop 직접 push 금지.
- 패키지 매니저: **yarn 4** (`yarn` 명령 사용, npm 금지). `packageManager`는 `yarn@4.14.1`로 정렬.
- 버전 핀(정확히): Expo `^56.0.0`, react-native `0.85.3`, react/react-dom `19.2.3`, @shopify/flash-list `2.0.2`, react-native-reanimated `4.3.1`, react-native-worklets `0.8.3`, react-native-screens `4.25.2`, react-native-safe-area-context `^5.7.0`, @react-native-async-storage/async-storage `^2.2.0`, react-native-svg `^15.15.4`, react-native-pager-view `^8.0.1`, ky `^2.0.2`, @tanstack/react-query `^5.99.0`, nativewind `^5.0.0-preview.4`, tailwindcss `^4.3.2`, zustand `^5.0.14`, immer `^11.1.8`, i18next `^26.3.3`, react-i18next `^17.0.8`, expo-localization `~56.0.6`, expo-image `~56.0.11`, react-native-gesture-handler `~2.31.1`, expo-symbols `~56.0.6`, expo-glass-effect `~56.0.4`.
- `resolutions`에 `lightningcss: 1.30.1` 추가.
- 경로 alias `@/` = `src/` (기존 tsconfig 유지).
- 각 태스크 종료 시 커밋. 커밋 메시지는 프로젝트 컨벤션(`build:`/`feat:`/`refactor:`/`chore:` prefix, 한국어 본문) 사용.
- 빌드 검증은 시뮬레이터에서 수행한다. 사용자가 직접 실행해야 하면 `! <command>` 안내.

---

### Task 1: 베이스라인 캡처 & 업그레이드 준비

**Files:**
- Modify: 없음 (검증 전용)

**Interfaces:**
- Produces: 현재 동작 베이스라인(빌드 성공 로그, 기능 체크리스트) — 이후 태스크의 회귀 비교 기준.

- [ ] **Step 1: 현재 의존성/Expo 버전 스냅샷 기록**

Run: `npx expo-doctor 2>&1 | tee /tmp/ontime-doctor-before.txt; node -e "console.log(require('./package.json').dependencies.expo)"`
Expected: 현재 expo 버전(`~55.0.9`)과 doctor 결과 출력. 경고가 있어도 기록만 한다.

- [ ] **Step 2: 작업 트리 클린 확인**

Run: `git status --short`
Expected: 무관한 변경 없음(스펙/플랜 문서 외). 변경이 있으면 사용자에게 알리고 중단.

- [ ] **Step 3: 베이스라인 빌드(iOS) 확인 — 선택적**

Run(사용자): `! yarn ios` (또는 이미 빌드 가능 상태면 생략)
Expected: 앱이 시뮬레이터에서 로그인 화면까지 도달. 결과를 체크리스트로 기록(로그인/홈/출퇴근/네비).

- [ ] **Step 4: 커밋 없음 (검증 태스크)**

이 태스크는 커밋하지 않는다. 다음 태스크로 진행.

---

### Task 2: Expo SDK 55 → 56 업그레이드

**REQUIRED SUB-SKILL:** `expo:upgrading-expo`

**Files:**
- Modify: `package.json` (dependencies/devDependencies/packageManager)
- Modify: `yarn.lock`

**Interfaces:**
- Produces: Expo 56 라인으로 정렬된 `package.json`. 이후 모든 태스크가 56 패키지를 전제.

- [ ] **Step 1: upgrading-expo 스킬 절차로 SDK 업그레이드**

`expo:upgrading-expo` 스킬을 호출하고 그 지침에 따라 다음을 수행한다:
Run: `yarn add expo@^56.0.0` 후 `npx expo install --fix`
Expected: expo 및 expo-* 패키지가 56 라인으로 변경.

- [ ] **Step 2: 핀 버전 정렬**

`package.json`의 다음 버전을 Global Constraints의 핀과 정확히 일치시킨다(react-native `0.85.3`, react/react-dom `19.2.3`, flash-list `2.0.2`, reanimated `4.3.1`, worklets `0.8.3`, screens `4.25.2`, safe-area `^5.7.0`, svg `^15.15.4`, pager-view `^8.0.1`, ky `^2.0.2`, react-query `^5.99.0`). `packageManager`를 `yarn@4.14.1`로 변경.

Run: `yarn install`
Expected: 설치 성공.

- [ ] **Step 3: expo-doctor 확인**

Run: `npx expo-doctor`
Expected: PASS 또는 알려진 비차단 경고만. NativeWind/Tailwind 관련 경고는 Task 3에서 해소되므로 허용.

- [ ] **Step 4: 타입체크**

Run: `npx tsc --noEmit`
Expected: ky 2 / react-query 변경으로 인한 타입 오류가 있으면 해당 호출부를 수정(예: ky 2 API 시그니처). 오류 0개까지 수정.

- [ ] **Step 5: 커밋**

```bash
git add package.json yarn.lock src
git commit -m "build: Expo SDK 55에서 56으로 업그레이드"
```

---

### Task 3: NativeWind 5 + Tailwind 4 마이그레이션

**Files:**
- Modify: `package.json` (nativewind, tailwindcss, @tailwindcss/postcss, postcss, react-native-css, resolutions)
- Modify: `metro.config.js`
- Modify: `babel.config.js`
- Modify: `tailwind.config.js`
- Modify: `src/app/global.css`
- Create: `postcss.config.js` (필요 시)

**Interfaces:**
- Produces: NativeWind 5 빌드 파이프라인. 이후 UI 태스크(Phase 2)가 전제하는 `dark:` 클래스 및 토큰 기반.

- [ ] **Step 1: NW5/TW4 의존성 추가**

Run:
```bash
yarn add nativewind@^5.0.0-preview.4 react-native-css@^3.0.7
yarn add -D tailwindcss@^4.3.2 @tailwindcss/postcss@^4.2.2 postcss@^8.5.16
```
`package.json`에 `"resolutions": { "lightningcss": "1.30.1" }` 추가 후 `yarn install`.
Expected: 설치 성공.

- [ ] **Step 2: metro.config.js 수정**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```
(주의: NW5는 `withNativewind` 소문자이며 `input` 인자를 받지 않는다.)

- [ ] **Step 3: babel.config.js 수정 (template와 동일 방식)**

template의 `babel.config.js`를 확인(`cat ../template-expo-app/babel.config.js`)하여 동일 preset 구성으로 맞춘다. template에 babel.config가 없고 preset이 app.json/플러그인으로 처리되면 on-time의 babel.config.js도 동일하게 정리한다(NW5는 babel preset 불요한 구성일 수 있음 — template 기준을 그대로 따른다).

- [ ] **Step 4: global.css 수정**

`src/app/global.css`를 template의 global.css 형식(`cat ../template-expo-app/src/app/global.css`)과 동일하게 맞춘다. template에 global.css가 없으면 NW5 문서 기준 `@import "tailwindcss";` 형식으로 변경.

- [ ] **Step 5: tailwind.config.js — 디자인 토큰 정의**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: '#f7f7f8', dark: '#000000' },
        surface: { DEFAULT: '#ffffff', dark: '#181818' },
        elevated: { DEFAULT: '#f0f0f2', dark: '#232323' },
        border: { DEFAULT: '#e6e6ea', dark: '#282828' },
        content: { DEFAULT: '#15171c', dark: '#ffffff' },
        muted: { DEFAULT: '#8a8f99', dark: 'rgba(255,255,255,0.5)' },
        brand: { DEFAULT: '#1ed760', border: '#1db954' },
        danger: { DEFAULT: '#e0455a', dark: '#f3727f' },
      },
    },
  },
  plugins: [],
};
```
(이 토큰은 Phase 2 UI 작업의 단일 출처다.)

- [ ] **Step 6: 빌드 검증**

Run: `npx expo start -c` (캐시 클리어 시작) — 번들링 에러가 없는지 확인 후 종료. 또는 `! yarn ios`.
Expected: Metro 번들 성공, NativeWind 변환 에러 없음. 기존 `className` 스타일이 렌더됨.

- [ ] **Step 7: 커밋**

```bash
git add package.json yarn.lock metro.config.js babel.config.js tailwind.config.js src/app/global.css postcss.config.js
git commit -m "build: NativeWind 5 및 Tailwind 4 마이그레이션, 디자인 토큰 정의"
```

---

### Task 4: zustand 스토어 도입 + 로그인 상태 이전

**Files:**
- Create: `src/shared/store/rootStore.ts`
- Create: `src/shared/store/types.d.ts`
- Create: `src/domain/users/store/users.state.ts`
- Create: `src/domain/users/store/slice.ts`
- Modify: `src/shared/providers/auth/AuthProvider.tsx`

**Interfaces:**
- Produces:
  - `useStore` (zustand hook), `BoundState` 타입 from `@/shared/store/rootStore`
  - `SlicePattern<T, S>` 타입 (전역 declare in `@/shared/store/types.d.ts`)
  - User slice actions: `loggedIn(userinfo: UserInfo): void`, `loggedOut(): void`; state: `isLoggedIn: boolean`, `userinfo?: UserInfo`
- Consumes: `UserInfo` 타입 from `@/shared/providers/auth/AuthProvider` (기존 정의).

- [ ] **Step 1: 의존성 추가**

Run: `yarn add zustand@^5.0.14 immer@^11.1.8`
Expected: 설치 성공.

- [ ] **Step 2: SlicePattern 타입 선언**

Create `src/shared/store/types.d.ts`:
```typescript
import { StateCreator } from 'zustand';

declare module 'zustand' {
  type SlicePattern<T, S = T> = StateCreator<S & T, [['zustand/immer', never], ['zustand/devtools', never]], [], T>;
}
```

- [ ] **Step 3: user slice 상태/액션 정의**

Create `src/domain/users/store/users.state.ts`:
```typescript
import { UserInfo } from '@/shared/providers/auth/AuthProvider';

type UserState = {
  userinfo?: UserInfo;
  isLoggedIn: boolean;
  loggedIn: (userinfo: UserInfo) => void;
  loggedOut: () => void;
};

export type { UserState };
```
(주의: `UserInfo`가 AuthProvider에 export 되어 있는지 확인. 없으면 AuthProvider에서 `export type { UserInfo }` 추가.)

- [ ] **Step 4: user slice 구현**

Create `src/domain/users/store/slice.ts`:
```typescript
import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

import { UserState } from './users.state';

const createUserSlice: SlicePattern<UserState, BoundState> = (set) => ({
  isLoggedIn: false,
  loggedIn: (userinfo) => set(() => ({ userinfo, isLoggedIn: true }), false, { type: 'user/loggedIn' }),
  loggedOut: () => set(() => ({ userinfo: undefined, isLoggedIn: false }), false, { type: 'user/loggedOut' }),
});

export default createUserSlice;
```

- [ ] **Step 5: rootStore 구성**

Create `src/shared/store/rootStore.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
      })),
      { name: 'on-time-app', storage: createJSONStorage(() => AsyncStorage) },
    ),
    { name: 'on-time-app', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState;
```

- [ ] **Step 6: AuthProvider가 store를 사용하도록 연결**

`src/shared/providers/auth/AuthProvider.tsx`를 수정: 기존 로그인 상태를 컴포넌트 로컬 state/Context로만 들고 있던 부분을 `useStore`의 `isLoggedIn`/`userinfo`/`loggedIn`/`loggedOut`으로 대체한다. AuthContext의 외부 인터페이스(소비처가 쓰는 `isLoggedIn`, `userinfo`, `accessToken` 등)는 **그대로 유지**하여 소비처 변경이 없도록 한다.

- [ ] **Step 7: 타입체크 & 번들 확인**

Run: `npx tsc --noEmit`
Expected: 오류 0개.
Run: `npx expo start -c` 후 로그인/로그아웃 동작 확인(또는 `! yarn ios`).
Expected: 로그인 상태가 persist되어 앱 재시작 시 유지됨.

- [ ] **Step 8: 커밋**

```bash
git add src/shared/store src/domain/users/store src/shared/providers/auth
git commit -m "refactor: 로그인 상태를 zustand 스토어로 이전"
```

---

### Task 5: 테마 상태 zustand 이전 (3-way: system/light/dark)

**Files:**
- Create: `src/domain/theme/store/theme.state.ts`
- Create: `src/domain/theme/store/slice.ts`
- Modify: `src/shared/store/rootStore.ts`
- Modify: `src/shared/providers/theme/ThemeProvider.tsx`

**Interfaces:**
- Consumes: `useStore`, `BoundState` from Task 4.
- Produces:
  - Theme slice state: `themePreference: 'system' | 'light' | 'dark'`; action: `setThemePreference(p: 'system' | 'light' | 'dark'): void`
  - `BoundState`가 `UserState & ThemeState`로 확장됨.

- [ ] **Step 1: theme slice 상태/액션 정의**

Create `src/domain/theme/store/theme.state.ts`:
```typescript
type ThemePreference = 'system' | 'light' | 'dark';

type ThemeState = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

export type { ThemePreference, ThemeState };
```

- [ ] **Step 2: theme slice 구현**

Create `src/domain/theme/store/slice.ts`:
```typescript
import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

import { ThemeState } from './theme.state';

const createThemeSlice: SlicePattern<ThemeState, BoundState> = (set) => ({
  themePreference: 'system',
  setThemePreference: (preference) =>
    set(() => ({ themePreference: preference }), false, { type: 'theme/setPreference' }),
});

export default createThemeSlice;
```

- [ ] **Step 3: rootStore에 theme slice 합성**

`src/shared/store/rootStore.ts` 수정:
```typescript
import createThemeSlice from '@/domain/theme/store/slice';
import { ThemeState } from '@/domain/theme/store/theme.state';
// ...
immer((...a) => ({
  ...createUserSlice(...a),
  ...createThemeSlice(...a),
})),
// ...
export type BoundState = UserState & ThemeState;
```

- [ ] **Step 4: ThemeProvider가 store를 사용하도록 연결**

`src/shared/providers/theme/ThemeProvider.tsx` 수정: 테마 선호를 `useStore(themePreference/setThemePreference)`에서 읽고, NativeWind `useColorScheme().setColorScheme()`에 반영한다. `'system'`이면 기기 `useColorScheme`(react-native)을 따른다. ThemeContext의 외부 인터페이스는 유지하되 선호 setter를 store 기반으로 노출.

- [ ] **Step 5: 타입체크 & 동작 확인**

Run: `npx tsc --noEmit`
Expected: 오류 0개.
Run: `npx expo start -c` 후 `(more)/theme` 화면에서 system/light/dark 전환 → persist 확인(또는 `! yarn ios`).
Expected: 선호가 저장되고 재시작 시 유지.

- [ ] **Step 6: 커밋**

```bash
git add src/domain/theme/store src/shared/store/rootStore.ts src/shared/providers/theme
git commit -m "refactor: 테마 선호 상태를 zustand로 이전, system/light/dark 3-way 지원"
```

---

### Task 6: i18next 도입 (ko 우선)

**Files:**
- Create: `src/shared/i18n/index.ts`
- Create: `src/shared/i18n/types.d.ts`
- Create: `src/shared/i18n/locales/ko.json`
- Create: `src/shared/i18n/locales/en.json`
- Create: `src/shared/providers/i18n/I18nProvider.tsx`
- Modify: `src/app/_layout.tsx` (Provider 트리에 I18nProvider 추가)

**Interfaces:**
- Produces:
  - `i18n` default export, `SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`, `resolveDeviceLanguage()` from `@/shared/i18n`
  - `SupportedLanguage` 타입 (전역 declare)
  - `I18nProvider` 컴포넌트
- Consumes: `expo-localization` `getLocales()`.

- [ ] **Step 1: 의존성 추가**

Run: `yarn add i18next@^26.3.3 react-i18next@^17.0.8 && npx expo install expo-localization`
Expected: 설치 성공.

- [ ] **Step 2: SupportedLanguage 타입 선언**

Create `src/shared/i18n/types.d.ts`:
```typescript
type SupportedLanguage = 'ko' | 'en';
```

- [ ] **Step 3: i18n 초기화 (ko 기본)**

Create `src/shared/i18n/index.ts` — template의 `src/shared/i18n/index.ts`와 동일하되 **`DEFAULT_LANGUAGE`를 `'ko'`로** 설정:
```typescript
import { getLocales } from 'expo-localization';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ko from './locales/ko.json';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko';

export const resolveDeviceLanguage = (): SupportedLanguage => {
  const locales = getLocales();
  for (const locale of locales) {
    const code = locale.languageCode?.toLowerCase();
    if (code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code)) {
      return code as SupportedLanguage;
    }
  }
  return DEFAULT_LANGUAGE;
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: { ko: { translation: ko }, en: { translation: en } },
      lng: resolveDeviceLanguage(),
      fallbackLng: DEFAULT_LANGUAGE,
      compatibilityJSON: 'v4',
      interpolation: { escapeValue: false },
      returnNull: false,
    })
    .catch((err) => console.error('i18n init failed', err));
}

export default i18n;
```

- [ ] **Step 4: locale 파일 생성 (탭/공통 키 시드)**

Create `src/shared/i18n/locales/ko.json`:
```json
{
  "tabs": { "home": "홈", "schedule": "스케줄", "todo": "투두", "more": "더보기" },
  "common": { "clockIn": "출근 입력", "clockOut": "퇴근 입력", "cancel": "취소", "confirm": "확인" }
}
```
Create `src/shared/i18n/locales/en.json` (스캐폴딩, 동일 키 영문):
```json
{
  "tabs": { "home": "Home", "schedule": "Schedule", "todo": "To-do", "more": "More" },
  "common": { "clockIn": "Clock in", "clockOut": "Clock out", "cancel": "Cancel", "confirm": "Confirm" }
}
```

- [ ] **Step 5: I18nProvider 생성**

Create `src/shared/providers/i18n/I18nProvider.tsx` — template의 동일 파일을 참고하여 `i18n`을 import하고 `I18nextProvider`로 children을 감싼다:
```typescript
import { PropsWithChildren } from 'react';

import { I18nextProvider } from 'react-i18next';

import i18n from '@/shared/i18n';

export default function I18nProvider({ children }: PropsWithChildren) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

- [ ] **Step 6: Provider 트리에 추가**

`src/app/_layout.tsx`에서 Provider 트리 최상위 근처에 `<I18nProvider>`를 추가(ThemeProvider 안, RQProvider 밖 위치 권장 — template 트리 참고).

- [ ] **Step 7: 타입체크 & 동작 확인**

Run: `npx tsc --noEmit`
Expected: 오류 0개.
Run: `npx expo start -c` 후 앱 부팅 확인.
Expected: 크래시 없음, `useTranslation()` 사용 가능.

- [ ] **Step 8: 커밋**

```bash
git add src/shared/i18n src/shared/providers/i18n src/app/_layout.tsx package.json yarn.lock
git commit -m "feat: i18next 도입(ko 기본), I18nProvider 및 로케일 시드 추가"
```

---

### Task 7: 신규 라이브러리 추가 (expo-image / gesture-handler / symbols / glass-effect)

**Files:**
- Modify: `package.json`, `yarn.lock`
- Modify: `src/app/_layout.tsx` (GestureHandlerRootView 래핑)

**Interfaces:**
- Produces: `expo-image`, `expo-symbols`, `expo-glass-effect`, `react-native-gesture-handler` 사용 가능. Phase 2/3가 이를 전제.

- [ ] **Step 1: 설치**

Run: `npx expo install expo-image expo-symbols expo-glass-effect react-native-gesture-handler`
Expected: 56 호환 버전 설치(Global Constraints 핀과 일치).

- [ ] **Step 2: GestureHandlerRootView 래핑**

`src/app/_layout.tsx`의 최상위를 `import { GestureHandlerRootView } from 'react-native-gesture-handler';`로 감싼다:
```tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  {/* 기존 Provider 트리 */}
</GestureHandlerRootView>
```

- [ ] **Step 3: 빌드 검증 (네이티브 모듈 포함)**

Run(사용자): `! npx expo prebuild --clean && yarn ios`
Expected: gesture-handler/glass-effect 네이티브 모듈 포함 빌드 성공, 앱 정상 부팅.

- [ ] **Step 4: 커밋**

```bash
git add package.json yarn.lock src/app/_layout.tsx ios android
git commit -m "build: expo-image·gesture-handler·symbols·glass-effect 추가"
```

---

### Task 8: OS별 탭 레이아웃 분기 (iOS NativeTabs)

**Files:**
- Create: `src/app/(tabs)/_layout.ios.tsx`
- Modify: `src/app/(tabs)/_layout.tsx` (Android/공통 JS Tabs로 정리)

**Interfaces:**
- Consumes: i18n `t('tabs.*')` (Task 6), 현재 탭 라우트 이름(`(home)`, `schedule`, `todo`, `(more)`).
- Produces: iOS는 NativeTabs, Android는 기존 JS Tabs.

- [ ] **Step 1: 현재 _layout.tsx의 탭 구성 파악**

Run: `cat "src/app/(tabs)/_layout.tsx"`
Expected: 현재 Tabs 트리거 4개(`(home)`, `schedule`, `todo`, `(more)`)와 아이콘 매핑 확인. 이를 보존한다.

- [ ] **Step 2: iOS NativeTabs 레이아웃 생성**

Create `src/app/(tabs)/_layout.ios.tsx` (template 패턴 + 현재 라우트명):
```tsx
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTranslation } from 'react-i18next';

export default function IosTabLayout() {
  const { t } = useTranslation();

  return (
    <NativeTabs backBehavior="history" labelStyle={{ default: { fontSize: 10 } }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf="house.fill" />
        <NativeTabs.Trigger.Label>{t('tabs.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Icon sf="calendar" />
        <NativeTabs.Trigger.Label>{t('tabs.schedule')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="todo">
        <NativeTabs.Trigger.Icon sf="checklist" />
        <NativeTabs.Trigger.Label>{t('tabs.todo')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(more)">
        <NativeTabs.Trigger.Icon sf="ellipsis" />
        <NativeTabs.Trigger.Label>{t('tabs.more')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```
(주의: 실제 탭 라우트가 다르면 Step 1 결과에 맞춰 trigger name을 수정.)

- [ ] **Step 3: Android/공통 _layout.tsx 정리**

`src/app/(tabs)/_layout.tsx`는 기존 JS `Tabs`를 유지하되, 활성 색을 브랜드 그린(`#1ed760`)으로 맞춘다(Phase 2에서 최종 토큰화). expo-router는 `_layout.ios.tsx`가 있으면 iOS에서 우선 사용하고 그 외 플랫폼은 `_layout.tsx`를 쓴다.

- [ ] **Step 4: 빌드 검증 (양 플랫폼)**

Run(사용자): `! yarn ios` 그리고 `! yarn android`
Expected: iOS는 네이티브 탭바, Android는 JS 탭바. 4개 탭 모두 네비게이션 정상.

- [ ] **Step 5: 커밋**

```bash
git add "src/app/(tabs)/_layout.ios.tsx" "src/app/(tabs)/_layout.tsx"
git commit -m "feat: iOS NativeTabs 분기 레이아웃 추가"
```

---

### Task 9: 툴링 정렬 (ESLint 9 / prettier / lint 스크립트)

**Files:**
- Modify: `package.json` (devDependencies, scripts)
- Modify: `eslint.config.mjs`
- Modify: `yarn.lock`

**Interfaces:**
- Produces: `yarn lint` 스크립트, ESLint 9 + 최신 config RC.

- [ ] **Step 1: devDeps 업그레이드**

Run:
```bash
yarn add -D eslint@^9 "@bob-park/eslint-config-bobpark@^0.3.0-RC4-20260630" "@bob-park/prettier-config-bobpark@^0.4.0-RC1-20260630" typescript@~6.0.3
```
Expected: 설치 성공. (typescript 6 업그레이드로 타입 오류 발생 시 수정.)

- [ ] **Step 2: scripts에 lint 추가**

`package.json` scripts에 `"lint": "expo lint"` 추가.

- [ ] **Step 3: eslint.config.mjs를 새 config에 맞게 정렬**

template의 eslint 설정을 참고하여 `eslint.config.mjs`를 새 `@bob-park/eslint-config-bobpark` API에 맞춘다.

- [ ] **Step 4: lint & 타입체크**

Run: `yarn lint && npx tsc --noEmit`
Expected: lint 통과(또는 자동수정 가능한 항목만), 타입 오류 0개.

- [ ] **Step 5: 커밋**

```bash
git add package.json yarn.lock eslint.config.mjs
git commit -m "chore: ESLint 9 및 prettier/config 최신 버전 정렬, lint 스크립트 추가"
```

---

### Task 10: Phase 1 최종 회귀 검증

**Files:**
- Modify: 없음 (검증 전용) / 필요 시 발견된 버그 수정

**Interfaces:**
- Consumes: Task 1의 베이스라인 체크리스트.

- [ ] **Step 1: 클린 빌드 (iOS)**

Run(사용자): `! npx expo prebuild --clean && yarn ios`
Expected: 빌드 성공, 로그인 화면 도달.

- [ ] **Step 2: 기능 회귀 체크 (iOS)**

수동: 로그인 → 홈 렌더 → 출퇴근 화면 진입 → 탭 네비게이션(홈/스케줄/투두/더보기) → 테마 전환(system/light/dark) → 앱 재시작 후 로그인·테마 persist 확인.
Expected: Task 1 베이스라인 대비 회귀 없음.

- [ ] **Step 3: 클린 빌드 & 체크 (Android)**

Run(사용자): `! yarn android`
Expected: 빌드 성공, JS 탭바, 동일 기능 동작.

- [ ] **Step 4: expo-doctor 최종 확인**

Run: `npx expo-doctor`
Expected: PASS 또는 비차단 경고만.

- [ ] **Step 5: 발견된 회귀 수정 후 커밋(있을 경우)**

```bash
git add -A
git commit -m "fix: Phase 1 업그레이드 후 발견된 회귀 수정"
```
회귀가 없으면 커밋 생략. Phase 1 완료.

---

## Self-Review

- **Spec coverage:** 1.1 SDK(T2), 1.2 NW5/TW4(T3), 1.3 zustand 로그인·테마(T4,T5), 1.4 신규 라이브러리/i18n(T6,T7), 1.5 OS 레이아웃(T8), 1.6 툴링(T9), 검증(T1,T10) — 모두 매핑됨.
- **Placeholder scan:** babel/global.css는 "template 확인 후 동일하게"로 위임 — 이는 template가 검증된 출처이므로 의도적. 그 외 placeholder 없음.
- **Type consistency:** `useStore`/`BoundState`(T4) → T5에서 확장, `SupportedLanguage`(T6) 전역 선언, slice 액션 시그니처 일관.

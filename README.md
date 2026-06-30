# template-expo-app

Expo (React Native) 기반 앱 템플릿 프로젝트입니다. OAuth2 인증, 푸시 알림, 다크 모드 테마, 다국어(i18n), 애니메이션 스플래시 스크린이 사전 구성되어 있습니다.

## 기술 스택

- **Framework**: [Expo](https://expo.dev) SDK 56, React Native 0.85, React 19.2
- **Routing**: [expo-router](https://docs.expo.dev/router/introduction) ~56 (file-based, typed routes)
- **Styling**: [NativeWind](https://www.nativewind.dev) v5 (Tailwind CSS v4)
- **Server State**: [@tanstack/react-query](https://tanstack.com/query) v5
- **Client State**: [zustand](https://zustand.docs.pmnd.rs) v5 (slice 패턴, `immer`)
- **HTTP**: [ky](https://github.com/sindresorhus/ky)
- **Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **Notifications**: `expo-notifications`
- **i18n**: `i18next` v26, `react-i18next` v17, `expo-localization`
- **Animation**: `lottie-react-native` v7, `@lottiefiles/dotlottie-react`, `react-native-reanimated` v4 (`react-native-worklets`)
- **Date**: `dayjs` (한국어 로케일, duration/relativeTime 플러그인)
- **Language**: TypeScript ~6.0 (strict mode)
- **Package Manager**: Yarn 4 (Berry)

## 요구 사항

- Node.js LTS (>= 24 권장)
- Yarn 4.14.1 이상 (`corepack enable` 후 자동 활성화)
- iOS 빌드: macOS + Xcode + CocoaPods
- Android 빌드: Android Studio + JDK 17
- (선택) [EAS CLI](https://docs.expo.dev/eas/) — 클라우드 빌드/배포 시 필요

## 설치

```bash
# corepack을 통한 yarn 활성화 (최초 1회)
corepack enable

# 의존성 설치
yarn install
```

### 환경 변수 (.env)

프로젝트 루트에 `.env` 파일을 생성하고 아래 변수를 정의해야 합니다. Expo는 `EXPO_PUBLIC_` 접두사가 붙은 변수만 클라이언트 번들에 노출합니다.

```env
# API 서버
EXPO_PUBLIC_API_HOST=https://api.example.com

# OAuth2 인증 서버 (app.config.ts extra.auth 에서 사용)
AUTHORIZATION_HOST=https://auth.example.com
AUTHORIZATION_CLIENT_ID=your-client-id
AUTHORIZATION_CLIENT_SECRET=your-client-secret
```

| 변수                          | 설명                                                                | 사용처                         |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------ |
| `EXPO_PUBLIC_API_HOST`        | API 서버 base URL                                                   | `src/shared/api/index.ts`      |
| `AUTHORIZATION_HOST`          | OAuth2 인증 서버 base URL (`/oauth2/authorize`, `/oauth2/token` 등) | `app.config.ts` → `extra.auth` |
| `AUTHORIZATION_CLIENT_ID`     | OAuth2 Client ID                                                    | `app.config.ts` → `extra.auth` |
| `AUTHORIZATION_CLIENT_SECRET` | OAuth2 Client Secret                                                | `app.config.ts` → `extra.auth` |

> ⚠️ `EXPO_PUBLIC_*` 값은 빌드 시 클라이언트 번들에 포함됩니다. `AUTHORIZATION_*` 변수는 `EXPO_PUBLIC_` 접두사가 없으므로 클라이언트 번들에 직접 노출되지 않고
> `app.config.ts`의 `extra` 필드를 통해 런타임에 접근합니다.
>
> 환경 변수 변경 후에는 캐시를 비우고 서버를 재시작하세요: `yarn start --clear`

### 네이티브 설정 파일

- `google-services.json` 파일을 프로젝트 루트에 위치시켜야 Android 빌드가 가능합니다 (Firebase / 푸시 알림 사용).
- iOS의 경우 `GoogleService-Info.plist`를 추가하고 `app.config.ts`의 `ios` 항목에 등록해주세요.

## 실행

```bash
# Metro 개발 서버 시작
yarn start

# iOS 시뮬레이터에서 실행 (네이티브 빌드 포함)
yarn ios

# Android 에뮬레이터/디바이스에서 실행 (네이티브 빌드 포함)
yarn android

# 웹에서 실행
yarn web
```

> `expo-notifications`, `expo-secure-store` 등 네이티브 모듈이 포함되어 있으므로 **Expo Go**가 아닌 **Development Build**로 실행해야 합니다.

## 스크립트

| Script               | 설명                                                          |
| -------------------- | ------------------------------------------------------------- |
| `yarn start`         | Expo 개발 서버 실행                                           |
| `yarn ios`           | iOS 네이티브 빌드 후 실행                                     |
| `yarn android`       | Android 네이티브 빌드 후 실행                                 |
| `yarn web`           | 웹 모드로 실행                                                |
| `yarn lint`          | ESLint 검사                                                   |
| `yarn prettier`      | Prettier 포맷팅                                               |
| `yarn reset-project` | 스타터 코드를 `app-example`로 이동하고 빈 `app` 디렉토리 생성 |

## AI 코드 에이전트 (Claude Code)

Expo 관련 작업(네이티브 UI, expo-router, 데이터 패칭, SDK 업그레이드, 배포/CI 등)을 구현할 때는 `expo@expo-plugins` 플러그인의 스킬(`expo:building-native-ui`, `expo:upgrading-expo`, `expo:expo-deployment` 등)을 우선 활용합니다. 이 플러그인 스킬은 Claude Code 환경에서 동작하며, 이를 지원하지 않는 도구는 해당 안내를 무시합니다.

> agent 동작에 대한 상세 규칙은 `AGENTS.md` 및 `docs/agents/` 문서를 참조하세요.

## 디렉토리 구조

```
src/
├── app/                         # expo-router 라우트 (file-based routing)
│   ├── _layout.tsx              # 루트 레이아웃 (Provider 래핑 + 라우트 가드)
│   ├── login.tsx                # OAuth 로그인 화면
│   ├── callback.tsx             # OAuth 콜백 핸들러
│   ├── +not-found.tsx           # 404 페이지
│   ├── global.css               # Tailwind 글로벌 스타일
│   └── (tabs)/                  # 탭 네비게이션 그룹 (iOS: NativeTabs / Android: Tabs)
│       ├── _layout.tsx          # 탭 바 설정 (Android)
│       ├── _layout.ios.tsx      # 탭 바 설정 (iOS NativeTabs)
│       ├── (home)/              # 홈 화면 (_layout + index)
│       ├── schedule/            # 스케줄 화면 (_layout + index)
│       ├── notification/        # 알림/공지 화면 (_layout + index)
│       └── profile/             # 사용자 정보 / 테마 설정 (_layout + index)
├── domain/                      # 도메인 단위 비즈니스 로직
│   ├── notifications/           # 알림 도메인 (apis, queries, 타입)
│   └── users/                   # 사용자 도메인 (apis, store/slice, 타입)
├── shared/                      # 공용 모듈
│   ├── providers/               # Context Provider (auth, i18n, notification, theme, queries)
│   ├── loaders/                 # 앱 로더 (애니메이션 스플래시 스크린)
│   ├── components/              # 공용 컴포넌트 (Loading 등)
│   ├── api/                     # HTTP 클라이언트 (ky + Bearer 인증)
│   ├── store/                   # Zustand 루트 스토어 (rootStore, slice 결합)
│   ├── dayjs/                   # dayjs 설정 (Ko 로케일, 플러그인)
│   ├── i18n/                    # i18next 설정 및 로케일 (ko, en)
│   └── queries/                 # 공용 Query 타입 정의
└── utils/                       # 유틸리티 함수
```

## 주요 기능

### 인증 (OAuth2)

`AuthProvider`가 OAuth2 인증 흐름을 관리합니다.

1. `expo-auth-session`을 통해 OAuth 프로바이더로 리다이렉트
2. 인증 코드를 access/refresh 토큰으로 교환
3. `expo-secure-store`에 토큰 안전 저장
4. 만료 10분 전 자동 토큰 갱신
5. `Stack.Protected`를 통한 라우트 가드 (로그인 상태에 따라 분기)

### 푸시 알림

`NotificationProvider`가 `expo-notifications`를 래핑하여 디바이스 알림을 관리합니다. 알림 수신 시 커스텀 토스트 UI를 표시합니다.

### 테마 (다크 모드)

`ThemeProvider`가 light / dark / system 모드를 지원합니다. 선택한 테마는 `async-storage`에 영속화되며, NativeWind의 `dark:` 접두사를 통해 스타일을
전환합니다.

### 다국어 (i18n)

`I18nProvider`가 `i18next` + `react-i18next`를 래핑하여 다국어를 제공합니다. 한국어(`ko`), 영어(`en`)를 지원하며 `expo-localization`으로 디바이스 언어를 감지합니다.
사용자 선택(`system` / `ko` / `en`)은 `async-storage`에 영속화됩니다. 로케일 리소스는 `src/shared/i18n/locales/` 에 위치합니다.

### 전역 상태 (Zustand)

서버 상태는 `@tanstack/react-query`, 클라이언트 전역 상태는 `zustand`로 관리합니다. 도메인별 slice(`SlicePattern`)를 `src/shared/store/rootStore.ts`에서 결합하며, `immer` 미들웨어로 불변성을 유지합니다. 예: 사용자 도메인 slice는 `src/domain/users/store/slice.ts`에 위치합니다.

### 앱 로더

`AnimateAppLoader`가 Lottie 기반 애니메이션 스플래시 스크린을 제공합니다.

## 라우팅

| 경로                   | 화면               | 접근 조건     |
| ---------------------- | ------------------ | ------------- |
| `/login`               | OAuth 로그인       | 비로그인 상태 |
| `/callback`            | OAuth 콜백         | 비로그인 상태 |
| `/(tabs)/(home)`       | 홈                 | 로그인 상태   |
| `/(tabs)/schedule`     | 스케줄             | 로그인 상태   |
| `/(tabs)/notification` | 알림 / 공지        | 로그인 상태   |
| `/(tabs)/profile`      | 사용자 정보 / 설정 | 로그인 상태   |

## Path Alias

`tsconfig.json`에 다음 경로 별칭이 설정되어 있습니다.

| Alias        | 경로       |
| ------------ | ---------- |
| `@/*`        | `src/*`    |
| `@/assets/*` | `assets/*` |

## tanstack-query error handling

`tanstack-query` 사용 시 error handling 을 추가한다.

서버에서 내려주는 error 응답은 `ProblemDetail` 타입으로 정의한다.

```typescript
// src/shared/api/common.dto.ts

// ...

/**
 * ProblemDetail
 */
type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  timestamp: Date;
  exception: string;
};

// ...
```

`mutation` 작성 시 `onError` 에서 `err.data` 를 통해 `ProblemDetail` 을 전달한다.

```typescript
// tanstack-query 사용 시 (mutations)

// ...

export function useUserRegister({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'register'],
    mutationFn: (req: UserRegisterRequest) => register(req),
    onSuccess: async (data) => {
      onSuccess?.(data);

      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      onError?.(err.data); // error handling
    },
  });

  return { register: mutate, isLoading: isPending };
}

// ...
```

`hooks` 사용 시 `onError` 콜백에서 `code` 를 기준으로 분기 처리한다.

```typescript
// tanstack-query hooks 사용

// ...

const { register } = useUserRegister({
  onSuccess: (data) => console.log(data),
  onError: (err) => {
    if (err.code === 'BAD_REQUEST') {
      console.log('잘못된 요청');
    }
  },
});

// ...
```

## 빌드 / 배포 (EAS)

```bash
# EAS CLI 설치
npm i -g eas-cli

# 로그인
eas login

# 빌드
eas build --platform ios
eas build --platform android
```

빌드 프로필은 `eas.json`에서 관리합니다.

| 프로필        | 용도                                  |
| ------------- | ------------------------------------- |
| `development` | 개발용 내부 배포 (dev client)         |
| `preview`     | 미리보기 (Android APK, iOS 내부 배포) |
| `production`  | 프로덕션 빌드 (자동 버전 증가)        |

### EAS Build 이용하지 않고 로컬에서 빌드하기

- iOS
  - submit 하려면 반드시 `production` profile로 진행해야 함
  - `production`으로 진행해도 `.ipa` 파일이 생성되어, 등록된 기기에서 설치 가능
- Android
  - submit 하려면 반드시 `production` profile로 진행해야 함
  - 단, `production` profile로 하면 `.aab` 파일로 생성되어, 사용자가 임의로 설치할 수 없음
  - `.apk`로 생성하고 싶을 경우 `preview` profile로 진행

```bash
## iOS submit (반드시 Mac 및 Apple Developer 계정이 필요함)
eas build --platform ios --profile production --local

## Android (반드시 JDK 17 이하 필요함)
# Google Play Store submit
eas build --platform android --profile production --local

# preview 목적
eas build --platform android --profile preview --local
```

### EAS Submit (iOS)

사전에 빌드가 되어 있어야 합니다. (EAS Build 또는 Local Build)

```bash
# local build 인 경우
eas submit --platform ios --path {빌드파일경로}

# EAS Build 인 경우
eas submit --platform ios
```

# `PR` Merge 시 자동 version up 기능

`github workflows` + `github actions` 로 PR 시 자동으로 version up 을 진행한다.

### version pattern

[major].[minor].[patch]

#### major

PR 제목에 `xxx [major]` 인 경우 major 버전이 `+1` 된다.

#### minor

PR 제목에 `xxx [minor]` 인 경우 minor 버전이 `+1` 된다.

#### patch

PR 제목에 `xxx` 인 경우 patch 버전이 `+1` 된다.

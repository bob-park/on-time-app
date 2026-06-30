# AGENTS.md

> Cross-agent convention 문서. 모든 code agent(Claude Code, Cursor, Aider, Codex, Copilot 등)에 적용된다. 본문 영어, 도메인/비즈니스 라벨은 한국어.

세부 규칙은 `docs/agents/` 아래 토픽별 문서를 참조한다. 각 문서는 frontmatter(`title`, `scope`, `applies_to`, `related`) 와 TL;DR blockquote 로 시작하므로, 작업 전 첫 5~10줄만 확인하면 적용 여부를 판단할 수 있다.

## Precedence

User instructions > `CLAUDE.md` (Claude Code overlay) > `AGENTS.md`.
이 문서와 `README.md` 가 충돌하면 agent 행동에 대해서는 이 문서가 우선한다; `README.md` 는 사람 대상 onboarding 문서로 유지된다.

## Tooling

- Expo 관련 작업(네이티브 UI, expo-router, 데이터 패칭, SDK 업그레이드, 배포/CI 등)을 구현할 때는 `expo@expo-plugins` 플러그인의 스킬(`expo:building-native-ui`, `expo:upgrading-expo`, `expo:expo-deployment` 등)을 우선 활용한다.
- 플러그인 스킬은 Claude Code 환경에서 동작하며, 이를 지원하지 않는 agent 는 이 항목을 무시한다.

## Map

### Foundations

- [Project Overview](docs/agents/overview.md) — 앱 목적과 경계
- [Tech Stack & Requirements](docs/agents/tech-stack.md) — 스택/핀 버전 위치
- [Directory Structure & Placement Rules](docs/agents/structure.md) — `src/` 트리, 도메인 추가, expo-router 라우팅

### Conventions (`src/**/*.{ts,tsx}`)

- [Module & Path Aliases / Import Order](docs/agents/conventions/module-aliases.md)
- [File & Identifier Naming](docs/agents/conventions/naming.md)
- [TypeScript](docs/agents/conventions/typescript.md)
- [React Components, Comments & Section Comments](docs/agents/conventions/react-sections.md)

### Library Patterns

- [ky + React Query](docs/agents/libs/ky-react-query.md) — 공유 `api`, query key, mutation hook
- [Zustand Slice](docs/agents/libs/zustand-slice.md) — `SlicePattern`, action naming, persist/secure-store
- [NativeWind / Styling](docs/agents/libs/nativewind.md) — utility class, `dark:` 다크모드
- [Context Provider Pattern](docs/agents/libs/providers.md) — Provider/Context, `useMemo` value

### Workflows

- [Git Workflow](docs/agents/workflows/git.md) — branch, commit prefix, PR base, version bump
- [Dev Environment & Quality Gates](docs/agents/workflows/dev-env.md) — lint/prettier, 시뮬레이터 확인
- [Environment & Secrets](docs/agents/workflows/env-secrets.md) — `.env`, native config, secret 금지
- [Design Prompt Workflow](docs/agents/workflows/design-workflow.md) — 6단계 목업 워크플로우

## How to use

- 새 도메인 추가 → `structure.md` → `libs/ky-react-query.md` → `libs/zustand-slice.md`
- 새 화면/스크린 → `structure.md`(routing) → `conventions/react-sections.md`
- API + query hook 작성 → `libs/ky-react-query.md`
- 전역 상태 추가 → `libs/zustand-slice.md`
- Context provider 작성 → `libs/providers.md`
- 스타일링/다크모드 → `libs/nativewind.md`
- UI/디자인 목업 → `workflows/design-workflow.md`
- PR 올리기 → `workflows/git.md`
- 커밋 전 점검 → `workflows/dev-env.md`

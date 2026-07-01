---
title: Git Workflow (Branch / Commit / PR)
scope: .git/**
applies_to: branching, commits, opening PRs, version bumps
related:
  - ./dev-env.md
---

# Git Workflow (Branch / Commit / PR)

> `master`/`develop`/`feature/*`/`hotfix/*` 4-branch. feature PR base 는 반드시 `develop`(master 직접 금지). 커밋 prefix = `feat/refactor/fix/build/docs/test`. PR 제목의 `[major]`/`[minor]` 토큰이 version bump 결정.

## Branch naming

- `master` — production-ready. Releases cut from here. 매 release 마다 git tag (`vX.Y.Z`) 와 GitHub release 를 만든다.
- `develop` — integration branch for the next release.
- `feature/<topic>` — new feature work; `develop` 에서 분기, PR 로 `develop` 에 merge.
- `hotfix/<topic>` — released version 의 urgent fix; `master` 에서 분기, `master` 와 `develop` 양쪽에 merge.

`master` / `develop` 직접 push 금지 — 항상 PR 경유.

### Rules

- `<topic>` 는 lowercase, kebab-case (예: `feature/asset-upload`, `hotfix/jwt-scope-mapping`).
- `feature/*` 브랜치에서 PR 을 열 때 base 는 **반드시 `develop`**. master 직접 타겟 금지; master 승격은 별도 `develop` → `master` release PR 로 한다.
- `master` / `develop` 직접 커밋 금지 — 항상 PR.
- release 시 `master` 에 tag 생성; tag 이름은 아래 버전 패턴을 따른다.

## Commit message

Lowercase prefix + `:` + 간결한 메시지.

| Prefix     | Use for                                                          |
| ---------- | ---------------------------------------------------------------- |
| `feat`     | new feature                                                      |
| `refactor` | code restructure without behavior change (rename, extract, etc.) |
| `fix`      | bug or issue fix                                                 |
| `build`    | dependency / package manager changes (yarn, gradle, pods)        |
| `docs`     | documentation or comment changes                                 |
| `test`     | add or modify tests                                              |

예시 (한국어 본문 OK):

```
feat: 사용자 알림 설정 화면 추가
refactor: dto type 관련 전면 수정
fix: 토큰 만료 시 자동 재로그인 안 되던 문제 수정
build: expo SDK 55로 업그레이드
docs: AGENTS.md 추가
test: useUserNotifications 훅 테스트 추가
```

## PR & versioning

GitHub Actions 가 PR merge 시 버전을 auto-bump 한다. 버전 패턴: `[major].[minor].[patch]`.

- PR 제목에 `[major]` 포함 → major + 1
- PR 제목에 `[minor]` 포함 → minor + 1
- 그 외 → patch + 1

PR rules:

- Target branch: 보통 `develop` (hotfix 는 `master`).
- 제목은 release-note 한 줄로 읽히게 작성한다.
- 본문은 diff 가 무엇인지가 아니라 **왜** 변경하는지를 설명한다.

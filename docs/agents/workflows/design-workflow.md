---
title: Design Prompt Workflow
scope: docs/design/**, src/**
applies_to: UI/디자인 작업(목업, 레이아웃 비교, 비주얼 컴포넌트)
related:
  - ../../../CLAUDE.md
---

# Design Prompt Workflow

> 템플릿은 `./docs/design/`. UI 요청 시 6단계: 템플릿 확인 → (동의 시)임시 디렉토리에 HTML 목업 → 로컬 HTTP 서버 → 피드백 반복 → 최종 합의분만 `src/` 반영 → 서버 정리. agent-agnostic 계약.

**Template location:** `./docs/design/` — 재사용 가능한 system / UI design prompt 템플릿이 여기 있다.

UI / design 작업(목업, 레이아웃 비교, 비주얼 컴포넌트) 요청 시:

1. 새로 만들기 전에 `./docs/design/` 에서 적용 가능한 prompt 템플릿을 먼저 확인하고, 그 output style / artifact format 을 따른다.
2. superpowers brainstorming 을 쓰는 중이면 이 단계에서 visual companion 사용을 제안한다.
3. 사용자 동의 후, 정적 HTML 목업을 임시 디렉토리에 작성한다 (예: `/tmp/<topic>-mockup-<date>/`).
4. 로컬 HTTP 서버 구동 — `npx serve <dir>` 또는 `python3 -m http.server` — 후 URL 과 포트를 사용자에게 알린다.
5. 피드백 기반으로 반복한다. **최종 합의된 디자인만** 실제 `src/` 코드에 반영한다.
6. 디자인 iteration 세션이 끝나면(사용자가 최종 승인하거나 작업을 중단하면) HTTP 서버를 정리한다.

이 워크플로우는 agent-agnostic 이다. Claude Code 는 추가로 Visual Companion 을 쓸 수 있다(`CLAUDE.md` 참조); 위 6단계가 항상 계약으로 우선한다.

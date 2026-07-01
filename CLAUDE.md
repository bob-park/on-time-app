# CLAUDE.md

@AGENTS.md

> Claude Code overlay for **template-expo-app**.
> `AGENTS.md` (imported above) is the cross-agent source of truth.
> Everything below applies **only** when Claude Code is the active agent.

## Claude Code 전용 규칙

### Plan Mode

- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션)은 plan mode 로 진행한다.
- Plan mode 종료(`ExitPlanMode`)는 사용자 승인 이후에만 호출한다.

### Superpowers Skill 사용

- 작업 시작 전 관련 superpowers 스킬 적용 여부를 확인한다:
  - 새 기능 / 모호한 요구사항 → `superpowers:brainstorming`
  - 승인된 스펙의 구현 계획 작성 → `superpowers:writing-plans`
  - 계획 실행 → `superpowers:subagent-driven-development` 또는
    `superpowers:executing-plans`
  - 버그 / 회귀 / 예상치 못한 동작 → `superpowers:systematic-debugging`
- 다단계 작업은 TodoWrite(Task)로 진행 상황을 추적한다. 각 task 는
  시작 시 `in_progress`, 종료 시 `completed` 로 즉시 업데이트한다.

### Subagent 권고

- 광범위한 코드 탐색 → `Explore` subagent (read-only, 빠른 검색).
- 큰 변경의 구현 계획 수립 → `Plan` subagent.
- 서로 독립적인 병렬 작업 → 단일 메시지 안에서 여러 Agent 호출.

### Visual Companion

- [디자인 워크플로우](docs/agents/workflows/design-workflow.md) 를 Claude Code 에서 실행할 때, 시각
  자료가 필요한 단계에 한해 Visual Companion 사용을 제안할 수 있다.
- design-workflow.md 의 6 단계 워크플로우(템플릿 확인 → 목업 → 로컬 서버 →
  피드백 → src 반영 → 서버 정리)가 항상 우선한다.
- 최종 합의된 디자인만 `src/` 에 반영한다.

### 금지 사항 (사용자가 명시적으로 요청하지 않은 경우)

- `git push --force` 금지.
- `git reset --hard`, `git branch -D` 등 파괴적 git 명령 금지.
- `master` / `develop` 브랜치로 직접 push 금지 — 반드시 PR 경유.
- secret-bearing 파일 변경/커밋 금지: `.env`, `.env.local`,
  `google-services.json`, `GoogleService-Info.plist`.
- 사용자에게 검토 기회 없이 마이그레이션 스크립트 실행 금지.

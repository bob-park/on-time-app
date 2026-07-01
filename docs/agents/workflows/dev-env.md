---
title: Dev Environment & Quality Gates
scope: package.json
applies_to: running scripts, pre-commit lint/format, verifying UI changes
related:
  - ../tech-stack.md
  - ./git.md
---

# Dev Environment & Quality Gates

> 코드 변경 완료 전: `yarn lint` 통과, `yarn prettier` diff 없음. UI 변경은 가능하면 `yarn ios`/`yarn android` 로 시뮬레이터 확인. `.env` 변경 후 `yarn start --clear` 로 Metro 재시작.

## Quality gates

Before finishing any code change:

- `yarn lint` — must pass.
- `yarn prettier` — must produce no diff (formatting clean).
- UI-affecting 변경은 가능하면 앱을 실행해(`yarn ios` / `yarn android`) 시뮬레이터에서 확인한다.

## Metro

- `.env` 변경 후에는 `yarn start --clear` 로 Metro 를 재시작한다.

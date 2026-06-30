---
title: Environment & Secrets
scope: .env, app.config.ts, google-services.json, GoogleService-Info.plist
applies_to: env vars, secret handling, native config files
related:
  - ./dev-env.md
---

# Environment & Secrets

> `EXPO_PUBLIC_API_HOST` 만 클라이언트 번들 노출. `AUTHORIZATION_*` 는 `app.config.ts → extra.auth` 경유. native config(`google-services.json`, `GoogleService-Info.plist`)는 repo root 필요. secret-bearing 파일은 절대 커밋 금지.

- `.env` keys (full table in `README.md`):
  - `EXPO_PUBLIC_API_HOST` — client bundle 에 노출된다.
  - `AUTHORIZATION_HOST`, `AUTHORIZATION_CLIENT_ID`, `AUTHORIZATION_CLIENT_SECRET` — `EXPO_PUBLIC_` prefix **없음**; `app.config.ts → extra.auth` 로만 surface 된다.
- repo root 에 native config 파일 필요: `google-services.json` (Android), `GoogleService-Info.plist` (iOS).
- secret-bearing 파일은 절대 커밋하지 않는다.
- `.env` 변경 후 `yarn start --clear` 로 Metro 를 재시작한다.

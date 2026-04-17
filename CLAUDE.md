# On Time App

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Design Context

### Users
직장인 근태 관리용 모바일 앱. 주 사용자는 회사 출퇴근·휴가·일정을 기록하고 확인하는 일반 사무직 직장인. 사용 맥락은 출근길 지하철·엘리베이터 앞·사무실·퇴근 직전 — 대부분 **이동 중이거나 짧은 시간 안에 한 손으로** 확인하는 상황. "지금 내 남은 근무 시간", "오늘 누가 휴가지", "이번 주 초과근무 얼마나 됐지" 같은 **즉답형 질문**에 몇 초 안에 답이 나와야 한다.

### Brand Personality
**활기차고 / 경쾌하고 / 동기부여**. 공공기관 근태 시스템 같은 건조함이 아니라, 출근이 조금 덜 피곤하게 느껴지도록 하는 생활감 있는 도구. 숫자와 시간이 주인공이지만 차갑지 않게 — 리듬감 있는 타이포와 절제된 악센트 컬러로 하루를 여는 느낌을 준다. 과장된 애니메이션이나 이모지 도배는 금물. 경쾌함은 **간결함과 속도감**에서 나온다.

### Aesthetic Direction
- **레퍼런스**: Toss / Current / Revolut 같은 핀테크 앱 — 타이포 중심, 큰 숫자, 넉넉한 여백, 핵심 메트릭에 시선이 모이는 구조.
- **안티-레퍼런스**: 그룹웨어/ERP 스타일 표·그리드, 아이콘+제목+텍스트 카드 무한 반복, 쨍한 네온 글로우 다크 모드, 중앙 정렬 강제.
- **테마**: 라이트/다크 모두 지원하되 **다크 가독성 우선**. 순검정(#000) 금지, 브랜드 휴 쪽으로 살짝 기울인 뉴트럴 기반.
- **타입**: 숫자 tabular-nums 필수. 디스플레이(큰 숫자/헤딩)와 본문 페어링으로 위계 분리.
- **컬러**: 60-30-10. 색맹 고려 — 휴가 타입·상태·경고는 색+형태(아이콘/라벨/굵기)로 이중 인코딩.

### Design Principles
1. **숫자가 주인공이다** — 시간·카운트·남은 근무시간은 페이지에서 가장 큰 타이포로, 설명 라벨은 작고 낮은 위계로.
2. **한 손 썸-존을 존중한다** — 주요 액션은 화면 하단 60% 안쪽. 최소 터치 타겟 44pt.
3. **색에 의미를 몰아주지 않는다** — 색상만으로 구분되는 UI 금지. 색+형태 이중 표현.
4. **리듬은 여백에서 나온다** — 관련된 것은 촘촘히(8-12px), 섹션 간은 넉넉히(32-48px). 카드 남발 금지.
5. **다크 모드는 부가 기능이 아니다** — 모든 뷰를 다크에서 먼저 검증. 글로우·네온·순검정 금지.

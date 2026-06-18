# CLAUDE.md

## 1. Project Overview

이 프로젝트는 **AI 갈등 조정 판결 서비스**이다.

사용자가 갈등 상황을 AI와 먼저 정리한 뒤, 필요 시 상대방을 초대하여 1:1 조정 상태로 전환하고, 양측 진술을 기반으로 AI 판결과 관계 회복 제안을 제공한다.

### 핵심 서비스 흐름

```txt
AI 대화방 생성
→ AI 대화 (갈등 상황 입력 + AI 분석)
→ 진술저장
→ [혼자서 진행 / 상대방 초대] 선택
→ 진술 작성 (disputes/[id]/statement)
     │                        │
     ▼                        ▼
단독 AI 판결             초대 링크 발급
(판결 탭 바로 진입)       → 상대방 참여
                         → 1:1 조정 전환
                         → 상대방 진술 작성
                         → AI 1:1 판결
→ 판결 결과 확인
→ 선물추천
```

---

## 2. MVP Scope

### MVP 포함

```txt
- 카카오 로그인
- 약관 동의
- AI 대화방 생성
- AI와 갈등 상황 정리
- 단독 판결 (혼자서 진행)
- 초대 링크 발급
- 상대방 참여
- 1:1 조정 전환
- 양측 진술 작성
- AI 판결 생성
- 판결 결과 확인
- 판결 결과 카드
- 사건기록
- 달력
- 감정일기
- 마이페이지
- 하단 탭
- 선물추천
- 통계 API
- 홈/마이페이지 내 요약 통계 컴포넌트
```

### MVP 제외

```txt
- shop
- points
- user-items
- 내부 결제
- 카카오톡 선물하기 직접 연동
- 외부 상품 API 직접 연동
- statistics 독립 화면
- 관리자 페이지
- 푸시 알림
```

MVP 제외 기능은 구현하지 않는다.
필요한 경우 `docs/domains/*_FUTURE.md` 문서에만 정리한다.

---

## 3. Fixed Product Rules

### 작성 카테고리

작성 카테고리는 아래 4개만 사용한다.

```txt
연애
가족
친구
직장
```

아래 6개 카테고리 기준은 사용하지 않는다.

```txt
관계
금전
공간
시간
가치관
역할
```

### AI 대화방 정책

```txt
- 모든 방은 먼저 AI 대화방으로 생성한다.
- AI 대화방 단계에서는 갈등 정리, 감정 정리, 대화 방향 조언만 제공한다.
- AI 대화방 단계에서는 판결 점수를 생성하지 않는다.
- 진술저장 후 분기:
  - 혼자서 진행: disputes/[id]/statement에서 진술 작성 후 단독 AI 판결 가능
  - 상대방 초대: disputes/[id]/statement에서 진술 작성 후 초대 링크 발급 → 1:1 AI 판결은 상대방 참여 후 가능
- 단독 판결과 1:1 판결 모두 disputes/[id]/statement를 거친다.
```

### AI 판결 결과

AI 판결 결과에는 아래 항목을 중심으로 제공한다.

```txt
- A/B 판결 점수
- 핵심 쟁점 요약
- 판결 근거
- 화해 제안
- 화해 메시지
- 선물추천 문구
- 16가지 세부 결과 유형 중 AI 도출 유형
```

아래 항목은 구현하지 않는다.

```txt
- A/B 공감 지수
- A/B 소통 태도 점수
```

### 결과 유형 관리

결과 유형은 코드 Enum 하드코딩을 금지한다.
상위 결과 그룹과 세부 결과 유형은 DB 마스터 데이터 기준으로 관리한다.

---

## 4. Architecture Rules

이 프로젝트는 **DDD 중심 + 공통 UI 분리 보조 구조**를 따른다.

### 기본 구조 원칙

```txt
src/app/(page)    → 화면 라우트
src/app/api       → API Route Handler
src/domains       → 도메인별 비즈니스 로직, API client, hooks, constants
src/components    → 공통 UI / 레이아웃 / 피드백 컴포넌트
src/stores        → Zustand 기반 UI 상태
src/types         → 전역 타입
src/lib           → 공통 유틸, auth, api, db, ai, security, validators, constants
src/styles        → 전역 스타일, SCSS 변수, mixin
```

### 금지 구조

```txt
src/features
src/server
src/lib/types
src/lib/stores
src/domains/*/types
src/domains/*/stores
src/app/(page)/*/*.type.ts
src/app/(page)/*/*.store.ts
```

`features` 폴더는 사용하지 않는다.

### MUI 사용 허용 범위

```txt
허용:
- 달력 / 날짜 선택 UI: src/components/calendar/ 내 래핑 컴포넌트
- 피드백 UI (Toast/Snackbar): src/components/feedback/ 내 래핑 컴포넌트
- 아이콘: @mui/icons-material — 감정일기(diary) 기능 제외 전체 허용

금지:
- 감정일기(diary) 기능 내 아이콘은 lucide-react 사용 유지
- 전체 디자인 시스템을 MUI 기반으로 전환하지 않는다.
- 여러 페이지 / 도메인에서 MUI 컴포넌트를 직접 import하지 않는다.
- MUI ThemeProvider를 앱 전역에 적용하지 않는다.
- 전체 스타일 기준은 SCSS / SCSS Module을 유지한다.
```

### Calendar UI Rules

```txt
- 달력 UI는 MUI X Date Pickers 기반으로 구현한다.
- MUI 컴포넌트는 src/components/calendar/ 내 래핑 컴포넌트를 통해서만 사용한다.
- 달력 라이브러리는 래핑 컴포넌트 구조로 교체 가능성을 확보한다.
```

---

## 5. Domain Scope

### MVP 도메인

```txt
auth
common
room
dispute
judgement
gift
user
calendar
diary
statistics
```

`statistics`는 독립 화면을 의미하지 않는다.
MVP에서는 홈/마이페이지 요약 통계 컴포넌트와 API 중심으로만 사용한다.

### v2.0 확장 예정 도메인

```txt
shop
points
user-items
```

v2.0 확장 예정 도메인은 MVP 구현 폴더를 만들지 않는다.

```txt
src/domains/shop        생성 금지
src/domains/points      생성 금지
src/domains/user-items  생성 금지
```

---

## 6. State Transition Rules

상태 전이는 임의로 변경하지 않는다.
변경이 필요하면 반드시 문서 수정과 팀 승인을 먼저 진행한다.

### room_mode

```txt
ai_chat
→ invite_ready
→ one_to_one
→ closed / expired / deleted
```

### dispute_status

1:1 판결 경로:

```txt
draft
→ waiting_opponent
→ opponent_joined
→ both_submitted
→ judging
→ judged
→ closed / expired / deleted
```

단독 판결 경로:

```txt
draft
→ judging
→ judged
→ closed / expired / deleted
```

`jailed` 상태명은 사용하지 않는다.

---

## 7. Auth & Security Rules

### 권한 기준

```txt
AI 대화방 조회:
creator_user_id 기준

1:1 사건 조회:
dispute_participants.user_id 기준

감정일기 조회:
emotion_diaries.user_id 기준

판결 결과 조회:
해당 dispute 참여자만 가능
```

### 초대 링크 보안

```txt
- room_token 원문은 DB에 저장하지 않는다.
- room_token_hash만 저장한다.
- 만료된 초대 링크 접근은 차단한다.
- 삭제된 방/사건 접근은 차단한다.
- 생성자 본인이 본인 초대 링크로 role_b 참여하는 것을 차단한다.
- 이미 role_b가 존재하는 방에는 추가 참여를 차단한다.
```

### 민감 정보 보호

```txt
- 공유 이미지에 사건 원문을 포함하지 않는다.
- 결과 카드에 개인정보를 포함하지 않는다.
- 감정일기 원문은 통계, 공유 이미지, 외부 추천 기능에 노출하지 않는다.
- 로그에는 불필요한 원문과 민감 정보를 저장하지 않는다.
```

### 인증 방식

```txt
- 인증은 NextAuth + Kakao OAuth를 사용한다.
- Supabase Auth는 사용하지 않는다.
```

---

## 8. Data & DB Rules

### DB 네이밍

```txt
DB column: snake_case
Prisma field: camelCase
Prisma mapping: @map 사용
```

### 정합성 규칙

```txt
- AI 대화방 단계에서는 role_a / role_b를 확정하지 않는다.
- 1:1 조정 전환 시 생성자를 role_a로 확정한다.
- 상대방 참여 시 role_b로 확정한다.
- 하나의 dispute에는 role_a 1명, role_b 1명만 존재할 수 있다.
- 하나의 role은 하나의 진술만 작성할 수 있다.
- 동일 사용자가 role_a와 role_b를 동시에 가질 수 없다.
```

### DB 인프라

```txt
- DB는 Supabase Postgres를 사용한다.
- Prisma는 Supabase Postgres의 DATABASE_URL을 통해 연결한다.
```

### Storage 인프라

```txt
- Storage는 Supabase Storage를 사용한다.
- MVP Storage 사용 범위는 result-cards bucket으로 제한한다.
- 결과 카드 이미지 저장에 사용한다.
- SUPABASE_SERVICE_ROLE_KEY는 서버에서만 사용하며 클라이언트에 노출하지 않는다.
- 민감 원문(진술, 감정일기, AI 대화)은 Storage에 저장하지 않는다.
- 정적 에셋(캐릭터, 아이콘, 결과카드 템플릿 등)은 public/images에서 관리한다.
```

### 멱등성 / 중복 요청 방지

MVP에서 중복 요청 방지를 적용해야 하는 대상:

```txt
- AI 판결 생성 요청
- 진술 종료 요청
- 초대 참여 요청
- 삭제 / 비식별 처리 요청
```

포인트, 상품 구매, 결제 관련 멱등성은 v2.0 확장 문서에서 관리한다.

---

## 9. Frontend State Rules

### Zustand 사용 범위

Zustand는 UI 상태에만 사용한다.

```txt
- 모달
- 바텀시트
- 플로팅 메뉴
- 선택 날짜
- 로딩 UI
- 결과 카드 생성 중 상태
```

아래 데이터는 Zustand에 저장하지 않는다.

```txt
- 서버에서 조회한 도메인 데이터
- 사건 상세 데이터
- 판결 결과 데이터
- 감정일기 목록
- 통계 데이터
```

서버 데이터는 TanStack Query와 API 응답 기준으로 관리한다.

---

## 10. API / Server Rules

```txt
- API 응답은 공통 응답 구조를 따른다.
- API Route와 Server Service에는 try-catch 기반 예외 처리를 적용한다.
- Gemini API 실패, JSON 파싱 실패, timeout은 구분해서 처리한다.
- 권한 검증은 프론트가 아니라 서버에서 최종 수행한다.
- API 로직 구현 전 API 명세서를 확인한다.
```

---

## 11. Logging & Ops Rules

MVP에서는 Sentry 없이 아래 기준으로 시작한다.

```txt
- try-catch 기반 공통 에러 핸들러
- 공통 에러 응답
- DB 실패 로그
- Vercel Logs
```

로그 대상:

```txt
- API 오류
- AI 요청 실패
- 욕설/부적절 표현 필터링 결과
- 삭제 / 비식별 처리
- 초대 링크 오류
- 권한 오류
```

로그에는 불필요한 사건 원문, 감정일기 원문, 개인정보를 저장하지 않는다.

---

## 12. Git Workflow

현재 GitHub Organization 기반 팀 프로젝트로 진행한다.

### 기본 브랜치

```txt
main
dev
```

### 작업 브랜치

모든 작업은 `dev`에서 분기한다.

```txt
feature/*
fix/*
refactor/*
docs/*
infra/*
```

### PR 규칙

```txt
- main 직접 push 금지
- dev 직접 push 금지
- 작업 브랜치는 dev에서 생성
- PR 대상은 기본적으로 dev
- main 병합은 최종 배포 시에만 진행
- PR 전 로컬 실행 / 빌드 / 린트 확인
```

---

## 13. Claude Work Process

Claude는 작업 시 아래 순서를 따른다.

```txt
1. 관련 문서 확인
2. 작업 계획 제시
3. 사용자 승인 대기
4. 구현
5. 검증
6. 변경 파일 요약
7. 커밋 / PR 안내
```

문서가 없거나 문서 간 충돌이 있으면 구현하지 말고 질문한다.

---

## 14. STOP Conditions

아래 상황에서는 작업을 즉시 중단하고 사용자에게 확인한다.

```txt
- ERD 없이 Prisma schema 변경이 필요한 경우
- 상태 전이 규칙 변경이 필요한 경우
- 권한 쿼리 변경이 필요한 경우
- API 응답 구조 변경이 필요한 경우
- MVP 제외 기능 구현 요청이 발생한 경우
- shop / points / user-items 구현이 필요한 경우
- 6개 카테고리 기준 구현이 필요한 경우
- 공감 지수 / 소통 태도 점수 구현이 필요한 경우
- AI 대화방 없이 바로 1:1 사건 생성 흐름이 필요한 경우
- statistics 독립 화면 생성이 필요한 경우
- 결과 유형을 Enum으로 하드코딩하려는 경우
- 브랜치 없이 작업 중인 경우
- 도메인별 문서가 없는데 임의로 도메인 로직을 구현하려는 경우
```

---

## 15. Approval Required

아래 작업은 반드시 사용자 또는 팀 승인 후 진행한다.

```txt
- Prisma schema 변경
- DB relation 변경
- 상태 전이 규칙 변경
- 권한 검증 로직 변경
- API endpoint 추가 / 삭제 / 구조 변경
- 카카오 OAuth 설정 변경
- Gemini API 프롬프트 구조 변경
- 환경변수 추가 / 삭제
- 공통 폴더 구조 변경
- MVP 제외 기능을 구현 범위로 올리는 작업
```

---

## 16. Required Reference Documents

작업 전 필요한 문서를 확인한다.

```txt
docs/PROJECT_DECISIONS.md
docs/PRD.md
docs/FUNCTIONAL_REQUIREMENTS.xlsx
docs/NON_FUNCTIONAL_REQUIREMENTS.xlsx
docs/TASK_ASSIGNMENT.xlsx
docs/TECH_STACK.md
docs/ERD.md
docs/API_SPEC.md
docs/ARCHITECTURE.md
docs/INFRA.md
docs/guides/CLAUDE_WORKFLOW.md
docs/guides/GIT_WORKFLOW.md
docs/guides/PR_RULES.md
docs/guides/ENV_GUIDE.md
docs/guides/CODING_CONVENTION.md
docs/db/PRISMA_MAPPING.md
docs/db/MASTER_DATA.md
docs/db/STATUS_TRANSITION.md
docs/domains/*.md
```

도메인 상세 설계는 루트 `CLAUDE.md`에 작성하지 않는다.
도메인별 상세 내용은 `docs/domains/*.md`에서 관리한다.

도메인별 문서가 아직 없으면 임의 구현하지 않는다.
필요한 경우 담당자에게 문서 작성 또는 기준 확정을 요청한다.

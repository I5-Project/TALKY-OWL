# ARCHITECTURE.md

TALKY-OWL 시스템 아키텍처 문서

---

## 1. 시스템 개요

AI 갈등 조정 판결 서비스의 전체 시스템 구조를 정의한다.

```txt
[Client]  Next.js App Router (React 19)
    ↓
[Server]  Next.js API Route Handler
    ↓
[Data]    Supabase Postgres (Prisma ORM)
[AI]      Google Gemini API
[Storage] Supabase Storage
[Auth]    NextAuth + Kakao OAuth
[Deploy]  Vercel Hobby + GitHub Actions
```

---

## 2. 아키텍처 패턴

### DDD 중심 + 공통 UI 분리 보조 구조

```txt
src/
├── app/
│   ├── (page)/         → 화면 라우트 (Next.js App Router)
│   └── api/            → API Route Handler (서버 로직 진입점)
├── domains/            → 도메인별 비즈니스 로직, API client, hooks, constants
├── components/         → 공통 UI / 레이아웃 / 피드백 컴포넌트
├── stores/             → Zustand 기반 UI 상태
├── types/              → 전역 타입
├── lib/                → 공통 유틸, auth, api, db, ai, security, validators, constants
└── styles/             → 전역 스타일, SCSS 변수, mixin
```

### 금지 구조

```txt
src/features              → 사용하지 않음
src/server                → 사용하지 않음
src/lib/types             → types는 src/types에서 관리
src/lib/stores            → stores는 src/stores에서 관리
src/domains/*/types       → 도메인 내 별도 types 폴더 금지
src/domains/*/stores      → 도메인 내 별도 stores 폴더 금지
```

---

## 3. 계층 구조 (Layer Architecture)

```txt
┌─────────────────────────────────────────────┐
│              Presentation Layer             │
│  src/app/(page)/**   → 페이지 컴포넌트       │
│  src/components/**   → 공통 UI 컴포넌트       │
│  src/stores/**       → UI 상태 (Zustand)      │
├─────────────────────────────────────────────┤
│              Application Layer              │
│  src/domains/**      → 도메인 로직, hooks      │
│  src/app/api/**      → API Route Handler      │
├─────────────────────────────────────────────┤
│           Infrastructure Layer              │
│  src/lib/db          → Prisma Client          │
│  src/lib/ai          → Gemini API 연동        │
│  src/lib/auth        → NextAuth 설정          │
│  src/lib/api         → 공통 API 유틸           │
│  src/lib/security    → 보안 유틸               │
│  src/lib/validators  → 유효성 검사             │
└─────────────────────────────────────────────┘
```

### 계층 간 호출 규칙

```txt
- Presentation → Application → Infrastructure (단방향)
- 페이지 컴포넌트는 도메인 hooks를 통해 서버 데이터에 접근
- API Route는 도메인 서비스와 lib 유틸을 사용
- 도메인 간 직접 참조는 최소화
```

---

## 4. 데이터 흐름

### 클라이언트 → 서버 데이터 흐름

```txt
[페이지 컴포넌트]
    ↓ TanStack Query (useQuery / useMutation)
[도메인 API Client]  (src/domains/*/api.ts)
    ↓ fetch
[API Route Handler]  (src/app/api/**/route.ts)
    ↓ Prisma Client
[Supabase Postgres]
```

### AI 판결 요청 흐름

```txt
[클라이언트] POST /api/disputes/[id]/judge
    ↓
[API Route] 권한 검증 → 상태 검증 → 멱등성 체크
    ↓
[Gemini API] 진술 데이터 기반 판결 생성
    ↓
[Prisma] ai_judgements 저장
    ↓
[클라이언트] 판결 결과 조회
```

### 상태 관리 분리

```txt
UI 상태 (Zustand):
  - 모달 / 바텀시트 / 플로팅 메뉴
  - 선택 날짜 / 로딩 UI
  - 결과 카드 생성 중 상태

서버 데이터 (TanStack Query):
  - 사건 목록 / 상세
  - 판결 결과
  - 감정일기 목록
  - 통계 데이터
  - 사용자 프로필
```

---

## 5. 인증 흐름

```txt
[사용자] → 카카오 로그인 버튼 클릭
    ↓
[NextAuth] → Kakao OAuth Provider
    ↓
[카카오 서버] → 인증 코드 발급
    ↓
[Callback] /api/auth/callback/kakao
    ↓
[NextAuth] → JWT 토큰 생성 (세션 DB 미사용)
    ↓
[Prisma] → users / accounts 테이블 생성 또는 조회
    ↓
[클라이언트] → 세션 기반 인증 상태 유지
```

### 인증 방식 제약

```txt
- NextAuth v4 + Kakao OAuth만 사용
- Supabase Auth 사용 금지
- JWT 전략 사용 (sessions 테이블 없음)
- 최초 로그인 시 백엔드에서 랜덤 닉네임 생성
```

---

## 6. 핵심 서비스 흐름

### 단독 판결

```txt
방 생성 (room_mode: ai_room)
→ 진술 작성 및 제출
→ AI 판결 생성 (제한적 결과)
→ 판결 결과 확인
```

### 1:1 판결

```txt
방 생성 (room_mode: ai_room)
→ 초대 링크 발급 (room_mode: invite_ready)
→ 상대방 참여 (room_mode: one_to_one)
→ 1:1 조정 전환
→ 양측 진술 작성 및 제출
→ AI 판결 생성 (전체 결과)
→ 판결 결과 확인
→ 선물추천
```

### 상태 전이

```txt
room_mode:
  ai_room → invite_ready → one_to_one → closed / expired / deleted

dispute_status (1:1):
  draft → waiting_opponent → opponent_joined → both_submitted → judging → judged → closed / expired / deleted

dispute_status (단독):
  draft → waiting_opponent → judging → judged → closed / expired / deleted
```

---

## 7. 외부 서비스 연동

| 서비스 | 용도 | 접근 위치 | 키 관리 |
|--------|------|-----------|---------|
| Kakao OAuth | 사용자 인증 | NextAuth Provider | KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET |
| Google Gemini API | AI 판결 / 대화 | API Route 내 서버 전용 | GEMINI_API_KEY (NEXT_PUBLIC_ 금지) |
| Supabase Postgres | 데이터 저장 | Prisma Client | DATABASE_URL |
| Supabase Storage | 결과 카드 이미지 | API Route 내 서버 전용 | SUPABASE_SERVICE_ROLE_KEY (클라이언트 노출 금지) |

---

## 8. 배포 구조

```txt
GitHub Organization (I5-Project/TALKY-OWL)
    ↓ PR 병합 (dev 브랜치)
GitHub Actions
    ↓ Vercel CLI
Vercel Hobby (개인 계정)
    ↓
Production 서비스
```

### 브랜치 전략

```txt
main     → 최종 배포 기준 (보존용)
dev      → 개발 통합 브랜치 (배포 대상)
feature/* / fix/* / refactor/* / docs/* / infra/*
         → dev에서 분기하는 작업 브랜치
```

### 환경변수

```txt
- .env.local        → 로컬 개발 (Git 미추적)
- Vercel Dashboard   → 프로덕션 환경변수
- GitHub Secrets     → CI/CD용 (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
```

---

## 9. 보안 아키텍처

### 권한 검증

```txt
- 권한 검증은 프론트가 아니라 서버(API Route)에서 최종 수행
- 방 조회: creator_user_id 기준
- 1:1 사건 조회: dispute_participants.user_id 기준
- 감정일기 조회: emotion_diaries.user_id 기준
- 판결 결과 조회: 해당 dispute 참여자만 가능
```

### 초대 링크 보안

```txt
- room_token 원문은 DB에 저장하지 않음 (room_token_hash만 저장)
- 만료된 초대 링크 접근 차단
- 삭제된 방/사건 접근 차단
- 생성자 본인의 role_b 참여 차단
- 이미 role_b가 존재하는 방에 추가 참여 차단
```

### 민감 정보 보호

```txt
- 공유 이미지에 사건 원문 미포함
- 결과 카드에 개인정보 미포함
- 감정일기 원문은 통계/공유/외부 기능에 노출 금지
- 로그에 원문/민감 정보 미저장
- SUPABASE_SERVICE_ROLE_KEY 서버 전용
- GEMINI_API_KEY 서버 전용
```

---

## 10. 기술 스택 요약

| 분류 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | ^15.0.0 |
| UI | React | ^19.0.0 |
| Language | TypeScript | ^5.7.2 |
| ORM | Prisma | ^6.0.0 |
| Auth | NextAuth | v4 |
| 서버 데이터 | TanStack Query | ^5.62.0 |
| UI 상태 | Zustand | ^5.0.2 |
| 폼 관리 | React Hook Form + Zod | ^7.54.1 / ^3.23.8 |
| 스타일링 | SCSS / SCSS Module | sass ^1.83.0 |
| AI | Google Gemini API | @google/generative-ai ^0.21.0 |
| 차트 | recharts | ^3.0.0 |
| 아이콘 | @mui/icons-material, lucide-react | - |
| 이미지 생성 | html-to-image | ^1.11.11 |
| 배포 | Vercel Hobby | - |
| DB | Supabase Postgres | - |
| Storage | Supabase Storage | - |

---

## 11. 관련 문서

```txt
docs/ERD.md                    → 데이터베이스 설계
docs/API_SPEC.md               → API 엔드포인트 명세
docs/TECH_STACK.md             → 기술 스택 및 패키지 상세
docs/INFRA.md                  → 인프라 구성 상세
docs/DESIGN.md                 → 디자인 시스템 가이드
docs/db/STATUS_TRANSITION.md   → 상태 전이 규칙
docs/db/PRISMA_MAPPING.md      → Prisma 매핑 규칙
docs/db/MASTER_DATA.md         → 마스터 데이터 정의
docs/domains/*.md              → 도메인별 상세 설계
```

# 말해부엉 (TALKY-OWL)

<p align="center">
  <img src="public/images/common/logo.svg" alt="말해부엉 로고" width="200" />
</p>

<p align="center">
  <strong>AI 갈등 조정 판결 서비스</strong><br/>
  갈등 상황을 AI와 정리하고, 공정한 판결과 관계 회복 제안을 받아보세요.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Gemini_AI-API-4285F4?logo=google" alt="Gemini" />
</p>

---

## 서비스 소개

**말해부엉**은 사용자 간 갈등 상황을 AI가 분석하고 판결하는 서비스입니다.

### 핵심 흐름

```
[ 단독 판결 ]
방 생성 → 진술 작성 → AI 판결 (제한적 결과) → 결과 확인

[ 1:1 판결 ]
방 생성 → 초대 링크 발급 → 상대방 참여 → 양측 진술 → AI 판결 → 결과 확인 → 선물추천
```

### 주요 기능

| 기능 | 설명 |
|------|------|
| AI 판결 | 양측 진술 기반 공정한 판결 및 화해 제안 |
| 갈등 유형 분석 | 16가지 세부 유형으로 갈등 패턴 도출 |
| 감정일기 | 일상 속 감정을 기록하고 돌아보기 |
| 사건기록 | 과거 판결 내역 조회 |
| 달력 | 날짜별 감정일기·사건기록 조회 |
| 선물추천 | 판결 후 상대방 프로필 기반 선물 추천 |
| 결과 카드 | 판결 결과를 이미지로 저장·공유 |

---

## 기술 스택

### Frontend

| 기술 | 용도 |
|------|------|
| Next.js 15 (App Router) | 풀스택 프레임워크 |
| React 19 | UI 라이브러리 |
| TypeScript 5.7 | 타입 안전성 |
| SCSS Module | 스타일링 |
| Zustand | UI 상태 관리 (모달, 바텀시트 등) |
| TanStack Query | 서버 데이터 패칭·캐싱 |
| React Hook Form + Zod | 폼 관리·유효성 검사 |
| Recharts | 통계 차트 |
| Framer Motion / GSAP | UI·페이지 애니메이션 |
| MUI X Date Pickers | 달력·날짜 선택 UI |

### Backend / Infra

| 기술 | 용도 |
|------|------|
| Prisma 6 | ORM (PostgreSQL) |
| Supabase Postgres | 데이터베이스 |
| Supabase Storage | 결과 카드 이미지 저장 |
| Google Gemini API | AI 판결·분석 |
| NextAuth v4 (Kakao OAuth) | 인증 |
| Vercel | 배포·Cron·Logs |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (page)/          # 화면 라우트
│   │   ├── login/       # 로그인
│   │   ├── about/       # 서비스 소개
│   │   ├── calendar/    # 달력
│   │   ├── diary/       # 감정일기
│   │   ├── disputes/    # 사건 (진술·판결·갈등유형)
│   │   ├── rooms/       # 방 (진술 작성)
│   │   ├── records/     # 사건기록
│   │   ├── join/        # 초대 참여
│   │   ├── mypage/      # 마이페이지
│   │   └── ...
│   └── api/             # API Route Handler
│       ├── auth/        # NextAuth
│       ├── chatbot/     # AI 챗봇
│       ├── rooms/       # 방 CRUD·초대·참여
│       ├── disputes/    # 사건·진술·판결·선물추천
│       ├── diary/       # 감정일기
│       ├── calendar/    # 달력
│       ├── statistics/  # 통계
│       └── user/        # 사용자 정보
├── domains/             # 도메인별 비즈니스 로직·API client·hooks
│   ├── auth/
│   ├── calendar/
│   ├── diary/
│   ├── dispute/
│   ├── gift/
│   ├── judgement/
│   ├── room/
│   ├── statistics/
│   └── user/
├── components/          # 공통 UI·레이아웃·피드백 컴포넌트
├── stores/              # Zustand 상태
├── types/               # 전역 타입
├── lib/                 # 공통 유틸 (auth, api, db, ai, errors 등)
└── styles/              # 전역 스타일·SCSS 변수·mixin
```

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npm run prisma:generate

# 개발 서버 실행 (port 3030)
npm run dev

# Mock 서버 실행 (port 8081)
npm run mock
```

### 환경변수

`.env.example` 파일을 참고하여 `.env.local`을 생성합니다.

```bash
# Vercel에 등록된 환경변수를 로컬로 가져오기
vercel env pull .env.local
```

> `.env.local`은 Git에 포함하지 않습니다. 상세 내용은 [`docs/guides/ENV_GUIDE.md`](docs/guides/ENV_GUIDE.md)를 참고하세요.

### 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (port 3030) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run format` | Prettier 포맷 적용 |
| `npm run mock` | Mock 서버 실행 (port 8081) |
| `npm run prisma:generate` | Prisma 클라이언트 생성 |
| `npm run prisma:migrate` | Prisma 마이그레이션 실행 |

---

## 작성 카테고리

서비스에서 사용하는 갈등 카테고리는 4가지입니다.

```
연애 · 가족 · 친구 · 직장
```

---

## Git 브랜치 전략

```
main          ← 최종 배포
  └── dev     ← 개발 통합
       ├── feature/*
       ├── fix/*
       ├── refactor/*
       └── docs/*
```

- 모든 작업 브랜치는 `dev`에서 분기
- PR 대상은 기본적으로 `dev`
- `main` 병합은 최종 배포 시에만 진행

---

## 팀 정보

**I5-Project** 팀 프로젝트



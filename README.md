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

## 프로젝트 탄생 배경

### 문제 인식

일상 속 갈등은 누구에게나 발생하지만, 대부분 감정적으로 대응하거나 해결 없이 넘어갑니다.

- **객관적 판단의 부재** — 갈등 당사자는 자신의 입장에서만 상황을 해석하기 때문에, 제3자 없이는 공정한 판단이 어렵습니다.
- **관계 회복의 어려움** — 갈등 해결 후에도 서로의 감정을 풀어줄 구체적인 행동 제안이 없어, 관계가 소원해지는 경우가 많습니다.
- **감정 정리의 부재** — 갈등 상황에서 느끼는 감정을 체계적으로 돌아볼 수단이 없어, 같은 패턴의 갈등이 반복됩니다.

### 해결 방향

**"AI가 양측의 이야기를 듣고, 공정하게 판결하며, 관계 회복까지 제안하면 어떨까?"**

말해부엉은 이 질문에서 출발했습니다. 단순히 누가 맞고 틀렸는지를 가리는 것이 아니라, 갈등의 구조를 분석하고, 양측 모두에게 화해의 실마리를 제공하는 서비스를 목표로 합니다.

---

## 핵심 기능과 기술적 해결

### 1. AI 판결 시스템

**문제:** 양측의 진술을 편향 없이 분석하고, 근거 있는 판결을 생성해야 합니다.

**해결:**
- Google Gemini API를 활용한 구조화된 프롬프트 설계로, 양측 진술을 동일한 기준으로 분석
- A/B 판결 점수, 핵심 쟁점 요약, 판결 근거, 화해 제안, 선물추천 문구를 포함한 다층 결과 생성
- 16가지 세부 갈등 유형을 DB 마스터 데이터로 관리하여, AI가 상황에 맞는 유형을 도출
- 멱등성 처리로 AI 판결 중복 생성 방지

### 2. 단독 판결 ↔ 1:1 판결 전환 구조

**문제:** 혼자서도 이용할 수 있으면서, 상대방이 참여하면 자연스럽게 1:1 조정으로 전환되어야 합니다.

**해결:**
- 방(Room) → 사건(Dispute) → 판결(Judgement) 3단계 도메인 분리
- `room_mode` 상태 전이(`ai_room → invite_ready → one_to_one`)로 단독/1:1 흐름을 하나의 구조에서 관리
- 초대 토큰은 HMAC 해시만 DB에 저장하고 원문은 보관하지 않는 보안 설계
- 생성자 본인의 자기 초대, 이미 참여자가 있는 방에 대한 중복 참여 등 엣지 케이스 서버 측 차단

### 3. 감정일기와 갈등 패턴 추적

**문제:** 갈등은 반복되는 경우가 많은데, 사용자가 자신의 감정 패턴을 인식하기 어렵습니다.

**해결:**
- 사건과 독립적으로 작성 가능한 감정일기 시스템
- 달력 UI(MUI X Date Pickers)를 통해 날짜별 감정일기·사건기록을 통합 조회
- 카테고리별(연애, 가족, 친구, 직장) 통계 API로 갈등 패턴 시각화
- 감정일기 원문은 통계·공유 이미지·외부 기능에 절대 노출하지 않는 프라이버시 보호 원칙 적용

### 4. 선물추천을 통한 관계 회복

**문제:** 판결만으로는 관계 회복이 어렵고, 구체적인 행동으로 이어지는 경로가 필요합니다.

**해결:**
- 판결 후 상대방 프로필(성별, 연령, MBTI)을 기반으로 AI가 맞춤형 선물 추천
- 판결 결과에 포함된 화해 메시지와 선물추천 문구를 연계하여 자연스러운 관계 회복 유도
- 결과 카드를 이미지로 추출(`html-to-image`)하여 공유 가능

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

## 프로젝트를 통해 학습한 점

### DDD 기반 도메인 설계

10개 도메인(auth, room, dispute, judgement, gift, diary, calendar, statistics, user, common)을 명확히 분리하고, 각 도메인별 API client·hooks·constants를 독립적으로 관리하는 구조를 설계했습니다. 도메인 간 의존성을 최소화하면서도, 방 → 사건 → 판결로 이어지는 비즈니스 흐름은 자연스럽게 연결되도록 상태 전이 규칙을 정의했습니다.

### 상태 관리 전략의 분리

서버 데이터(사건, 판결, 일기 등)는 TanStack Query로, UI 상태(모달, 로딩 등)는 Zustand로 엄격히 분리했습니다. 이 분리를 통해 서버 데이터의 캐싱·동기화 문제와 UI 상태 관리 문제를 독립적으로 해결할 수 있었습니다.

### AI API 연동에서의 안정성 확보

Gemini API 호출 실패, JSON 파싱 실패, timeout을 구분하여 처리하고, 멱등성 검증으로 중복 판결 생성을 방지했습니다. AI 응답의 불확실성을 구조화된 프롬프트와 서버 측 검증으로 보완하는 경험을 쌓았습니다.

### 보안 설계 실무 적용

초대 토큰 해시 저장, 권한 검증 서버 전담, 민감 정보 로그 제외, 결과 카드 개인정보 비포함 등 보안 원칙을 설계 단계부터 적용했습니다. "보안은 기능이 아니라 설계 원칙"이라는 점을 체감한 프로젝트였습니다.

### 팀 협업과 문서 중심 개발

ERD, API 명세서, 도메인 문서, 상태 전이 규칙 등을 코드보다 먼저 정의하고, 문서 승인 후 구현하는 워크플로우를 운영했습니다. 문서가 곧 계약이 되어 팀원 간 인식 차이를 줄이고, 구현 범위의 모호함을 사전에 방지할 수 있었습니다.

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
├── components/          # 공통 UI·레이아웃·피드백 컴포넌트
├── stores/              # Zustand 상태
├── types/               # 전역 타입
├── lib/                 # 공통 유틸 (auth, api, db, ai, errors 등)
└── styles/              # 전역 스타일·SCSS 변수·mixin
```

---

## 팀원 소개

**I5-Project**

| 이름&nbsp;&nbsp;&nbsp;&nbsp; | GitHub | 역할 | 담당 영역 |
|:---|:---|:---|:---|
| <nobr>백종우</nobr> | [@evenif99](https://github.com/evenif99) | Full-Stack | 초기 세팅·인프라, 인증, 마이페이지, 서비스 소개, 배포·문서화 |
| <nobr>천주아</nobr> | [@juahcheon](https://github.com/juahcheon) | Full-Stack | 사건 도메인 API 설계, AI 판결 로직, 진술·사건조회 페이지, 욕설 필터 |
| <nobr>박정민</nobr> | [@wjdalss21](https://github.com/wjdalss21) | Full-Stack | 홈 화면, 판결 결과 페이지, 사건기록, 통계 API, 에러 페이지 |
| <nobr>배근영</nobr> | [@lyla-bae](https://github.com/lyla-bae) | Design / Frontend | 디자인 시스템, 전체 UI 스타일 개편, 초대 링크 연결, 에셋 관리 |
| <nobr>이승규</nobr> | [@SG-Develope](https://github.com/SG-Develope) | Full-Stack | 캘린더·월별 조회 API, 감정일기 CRUD, 선물추천 기능 |

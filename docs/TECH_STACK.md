# TECH STACK

TALKY-OWL 프로젝트 기술 스택 및 설치 패키지 정의서

---

## 인프라

| 분류 | 기술 | 비고 |
|------|------|------|
| Database | Supabase Postgres | Prisma ORM을 통해 연결 |
| Storage | Supabase Storage | result-cards bucket (MVP 범위) |
| Auth | NextAuth + Kakao OAuth | Supabase Auth 미사용 |
| 배포 | Vercel | 환경변수는 Vercel에서 관리 |

---

## 패키지 매니저

```txt
npm
```

---

## 설치 명령어

```bash
npm install
```

---

## Dependencies

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `next` | ^15.0.0 | Next.js 15 App Router 프레임워크 |
| `react` | ^19.0.0 | UI 라이브러리 |
| `react-dom` | ^19.0.0 | React DOM 렌더링 |
| `next-auth` | ^4.24.11 | 카카오 OAuth 인증 (NextAuth v4) |
| `@prisma/client` | ^6.0.0 | Prisma ORM 클라이언트 |
| `@google/generative-ai` | ^0.21.0 | Google Gemini API SDK |
| `zustand` | ^5.0.2 | UI 상태 관리 (모달, 바텀시트 등) |
| `@tanstack/react-query` | ^5.62.0 | 서버 데이터 패칭 및 캐싱 |
| `react-hook-form` | ^7.54.1 | 폼 상태 관리 |
| `@hookform/resolvers` | ^3.9.1 | React Hook Form + Zod 연동 |
| `zod` | ^3.23.8 | 스키마 유효성 검사 |
| `lucide-react` | ^0.468.0 | 아이콘 라이브러리 |
| `recharts` | ^3.0.0 | 차트 라이브러리 (통계 시각화) |
| `html-to-image` | ^1.11.11 | 판결 결과 카드 이미지 추출 |
| `sass` | ^1.83.0 | SCSS / SCSS Module 스타일링 |

---

## DevDependencies

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `typescript` | ^5.7.2 | TypeScript 컴파일러 |
| `@types/node` | ^22.0.0 | Node.js 타입 정의 |
| `@types/react` | ^19.0.0 | React 타입 정의 |
| `@types/react-dom` | ^19.0.0 | React DOM 타입 정의 |
| `eslint` | ^9.0.0 | 코드 린터 |
| `eslint-config-next` | ^15.0.0 | Next.js ESLint 규칙 프리셋 |
| `prettier` | ^3.4.2 | 코드 포맷터 |
| `prisma` | ^6.0.0 | Prisma CLI (마이그레이션, 스키마 관리) |
| `json-server` | ^0.17.4 | Mock API 서버 |

---

## 주요 선택 이유

### Gemini SDK — `@google/generative-ai`

Google 공식 Node.js SDK. Next.js App Router Server Actions 및 API Route와 호환되며, GCP 인프라 의존 없이 API 키만으로 사용 가능. (`@google-cloud/vertexai`는 GCP 환경 전용이므로 제외)

### 상태 관리 분리 전략

- **Zustand** → 모달, 바텀시트, 로딩 UI 등 순수 UI 상태만 담당
- **TanStack Query** → 서버 데이터 패칭, 캐싱, 동기화 담당
- 서버 데이터(사건, 판결, 일기 등)는 Zustand에 저장하지 않음

### recharts v3

v2.x는 deprecated 상태. v3로 업그레이드하여 최신 유지.

### next-auth v4

v5(beta)는 아직 프로덕션 안정성 미검증. 카카오 OAuth 연동이 v4에서 안정적으로 지원되므로 v4 사용.

---

## npm scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (port 3030) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 (port 3030) |
| `npm run lint` | ESLint 검사 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run format` | Prettier 포맷 적용 |
| `npm run format:check` | Prettier 포맷 검사 |
| `npm run mock` | Mock 서버 실행 (port 8081) |
| `npm run prisma:generate` | Prisma 클라이언트 생성 |
| `npm run prisma:migrate` | Prisma 마이그레이션 실행 |

---

## 환경변수

`.env.example` 파일을 참고하세요.

실제 `.env.local`은 팀 내부에서 공유하지 않습니다.
Vercel에 등록된 환경변수를 아래 명령어로 로컬에 가져올 수 있습니다.

```bash
vercel env pull .env.local
```

---

## 버전 고정 기준

`package-lock.json`을 Git에 포함하여 팀원 전체가 동일한 버전으로 설치합니다.

```bash
# 신규 팀원 환경 세팅
npm ci
```

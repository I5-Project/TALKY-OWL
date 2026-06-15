# INFRA.md

TALKY-OWL 인프라 구성 문서

---

## 1. 인프라 개요

| 분류 | 기술 | 비고 |
|------|------|------|
| Hosting | Vercel Hobby | Vercel Team 미사용 |
| Database | Supabase Postgres | Prisma ORM 연결 |
| Storage | Supabase Storage | result-cards bucket (MVP 범위) |
| Auth | NextAuth + Kakao OAuth | Supabase Auth 미사용 |
| AI | Google Gemini API | 서버 API Route에서만 사용 |
| CI/CD | GitHub Actions + Vercel CLI | 별도 작업에서 workflow 구성 |

---

## 2. Hosting

```txt
플랫폼:   Vercel Hobby
계정:     배포 전용 Google 계정 1개
팀 구성:  Vercel Team 미사용
팀원:     Vercel Team에 초대하지 않음
배포 방식: GitHub Actions + Vercel CLI
```

Vercel Team을 사용하지 않기 때문에, GitHub Organization repo와의 연동은 GitHub Actions + Vercel CLI 방식으로 구성한다.

---

## 3. Deployment

### 배포 흐름

```txt
GitHub Organization (I5-Project/TALKY-OWL)
→ dev 브랜치 PR 병합
→ GitHub Actions에서 Vercel CLI 배포
→ 개인 Vercel Hobby 프로젝트로 배포
```

### 브랜치 기준

```txt
dev:  개발 통합 브랜치. 배포 대상 브랜치
main: 최종 배포 기준 브랜치 (보존용)
```

### 필요한 GitHub Actions Secrets

```txt
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

실제 workflow 파일은 별도 작업 브랜치에서 생성한다.

---

## 4. Database

```txt
플랫폼:    Supabase Postgres
ORM:       Prisma
연결 방식: DATABASE_URL 환경변수를 통해 Prisma와 연결
```

```txt
DATABASE_URL: Supabase Postgres 연결 문자열
              Supabase Dashboard > Project Settings > Database > Connection String (URI)
```

---

## 5. Storage

```txt
플랫폼:   Supabase Storage
MVP 범위: result-cards bucket 중심
용도:     판결 결과 카드 이미지 저장
```

버킷 구분:

```txt
result-cards   판결 결과 카드 이미지 (MVP 사용 대상)
```

```txt
정적 에셋 (캐릭터, 아이콘, 결과카드 템플릿 등)은 public/images에서 관리한다.
Supabase Storage는 서비스 실행 중 생성되는 결과 카드 이미지 저장에 사용한다.
```

MVP 제외 범위:

```txt
- 진술 원문 이미지 저장
- 감정일기 원문 이미지 저장
- AI 대화 원문 캡처 저장
- 사용자 첨부파일 저장
- 프로필 이미지 업로드 (추후 확장 검토)
```

접근 원칙:

```txt
- SUPABASE_SERVICE_ROLE_KEY는 서버에서만 사용한다.
- 클라이언트에서 Service Role Key 사용 금지.
- 업로드/삭제/비공개 접근은 Next.js API Route를 통해 서버에서 처리한다.
```

---

## 6. Auth

```txt
방식:   NextAuth + Kakao OAuth
라이브러리: next-auth v4
```

```txt
Supabase Auth는 사용하지 않는다.
인증은 NextAuth + Kakao OAuth를 유지한다.
```

Kakao Redirect URI:

```txt
로컬:       http://localhost:3030/api/auth/callback/kakao
Production: https://[프로덕션도메인]/api/auth/callback/kakao
```

---

## 7. AI

```txt
플랫폼:    Google Gemini API
SDK:       @google/generative-ai
사용 범위: 서버 API Route에서만 사용
```

```txt
GEMINI_API_KEY는 클라이언트에 노출하지 않는다.
NEXT_PUBLIC_ prefix 사용 금지.
```

---

## 8. 환경변수 관리

```txt
- .env.example에는 key 이름만 관리한다.
- 실제 값은 Vercel Dashboard Environment Variables에 등록한다.
- GitHub Actions 배포용 Secrets는 GitHub Repository Secrets에 별도 등록한다.
- .env.local은 Git에 커밋하지 않는다.
```

상세 내용은 아래 문서를 참고한다:

```txt
docs/guides/ENV_GUIDE.md
docs/guides/VERCEL_DEPLOYMENT_GUIDE.md
```

---

## 9. 수동 설정 필요 항목

아래 항목은 배포 담당자가 직접 설정한다.

```txt
- Vercel 프로젝트 생성 (배포 전용 계정)
- Vercel Environment Variables 등록
- GitHub Repository Secrets 등록 (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- Supabase 프로젝트 생성
- Supabase result-cards bucket 생성
- Kakao Developers Redirect URI 등록
- GitHub Actions workflow 생성 (별도 작업 브랜치)
- main / dev Branch Protection 설정
```

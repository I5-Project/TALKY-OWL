# ENV_GUIDE.md

환경변수 운영 가이드

---

## 1. 문서 목적

이 문서는 TALKY-OWL 프로젝트의 환경변수 관리 기준을 정의한다.

모든 팀원은 이 문서를 기준으로 로컬 환경을 세팅하고, 환경변수를 다룰 때 반드시 준수한다.

---

## 2. 환경변수 관리 원칙

```txt
- .env.example에는 key 이름만 작성한다. 실제 값은 작성하지 않는다.
- .env.local은 Git에 커밋하지 않는다.
- .env.local은 Claude Code가 생성하거나 읽지 않는다.
- 실제 secret 값은 메신저, PR, GitHub, Notion, 문서에 포함하지 않는다.
- Vercel Environment Variables 등록/수정은 배포 담당자 또는 PM이 수행한다.
- 팀원은 Vercel Team에 초대하지 않는다.
```

---

## 3. .env.example 관리 기준

`.env.example`은 Git에 포함한다.

```txt
- key 이름만 작성하고 실제 값은 비워둔다.
- 새 환경변수가 생기면 .env.example에 key만 추가하고 PR에 포함한다.
- Vercel에는 배포 담당자가 실제 값을 별도로 등록한다.
```

추가 순서:

```txt
1. .env.example에 key만 추가
2. Vercel Dashboard > Project Settings > Environment Variables에 실제 값 등록
3. PR에 .env.example 변경사항 포함
4. 팀원에게 새 환경변수 추가 사실 공유
```

---

## 4. .env.local 관리 기준

```txt
- .env.local은 Git에 커밋하지 않는다.
- .gitignore에 .env.local이 포함되어 있는지 확인한다.
- 로컬에서만 사용하며 팀원 간 공유하지 않는다.
- Claude Code는 .env.local을 생성하거나 읽지 않는다.
```

팀원 로컬 세팅 방식은 아래 섹션을 참고한다.

---

## 5. Vercel Environment Variables 관리 기준

```txt
- Vercel Team은 사용하지 않는다.
- 배포 전용 Google 계정 1개로 Vercel Hobby 프로젝트를 운영한다.
- 팀원은 Vercel Team에 초대하지 않는다.
- Vercel Environment Variables 등록/수정은 배포 담당자 또는 PM이 수행한다.
```

등록 경로:

```txt
Vercel Dashboard > 프로젝트 선택 > Settings > Environment Variables
```

등록 기준:

```txt
- Production: 프로덕션 배포에 사용되는 값
- Preview: PR Preview 배포에 사용되는 값 (필요 시)
- Development: 개발 환경 값 (필요 시)
```

---

## 6. GitHub Actions Secrets 관리 기준

GitHub Actions로 Vercel CLI 배포를 구성할 경우, 아래 값을 GitHub Repository Secrets에 등록한다.

```txt
GitHub Repository > Settings > Secrets and variables > Actions
```

필요한 Secrets:

```txt
VERCEL_TOKEN       Vercel Personal Access Token
VERCEL_ORG_ID      Vercel 프로젝트의 orgId (vercel.json 또는 .vercel/project.json 확인)
VERCEL_PROJECT_ID  Vercel 프로젝트 ID
```

주의:

```txt
- 위 값들은 .env.example에 포함하지 않는다.
- 실제 값은 문서에 작성하지 않는다.
- GitHub Actions workflow 파일은 별도 작업에서 생성한다.
```

---

## 7. Supabase 환경변수

| 키 | 용도 | 서버 전용 여부 |
|----|------|--------------|
| `DATABASE_URL` | Supabase Postgres 연결 문자열. Prisma 연결에 사용 | 서버 전용 |
| `SUPABASE_URL` | Supabase 프로젝트 URL | 공개 가능 |
| `SUPABASE_ANON_KEY` | 클라이언트 공개 범위 anon key | 공개 가능 (제한적) |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 관리 key. 클라이언트 절대 노출 금지 | **서버 전용** |
| `SUPABASE_STORAGE_BUCKET_RESULT_CARDS` | 결과 카드 이미지 저장용 bucket 이름. 권장 값: `result-cards` (**MVP 제외, 추후 확장**) | 서버 전용 |

**MVP 기준:**

```txt
- SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_STORAGE_BUCKET_RESULT_CARDS는
  MVP 필수 변수가 아니다.
- MVP에서는 DATABASE_URL, DIRECT_URL만 Supabase 연결에 필요하다.
- Supabase Storage 관련 변수는 추후 결과 카드 영구 저장 기능 확장 시 활성화한다.
- MediaAsset 모델은 Prisma schema에 스캐폴딩으로 포함되어 있으나 MVP에서 직접 사용하지 않는다.
```

**SUPABASE_SERVICE_ROLE_KEY 주의사항:**

```txt
- 클라이언트(브라우저) 코드에서 절대 사용하지 않는다.
- NEXT_PUBLIC_ prefix를 사용하지 않는다.
- 업로드, 삭제, 비공개 파일 접근은 Next.js API Route를 통해 서버에서만 처리한다.
```

---

## 8. NextAuth / Kakao OAuth 환경변수

| 키 | 용도 |
|----|------|
| `NEXTAUTH_URL` | NextAuth 콜백 URL. 로컬: `http://localhost:3030`, 프로덕션: 실제 도메인 |
| `NEXTAUTH_SECRET` | NextAuth 세션 서명 key. 서버 전용 |
| `KAKAO_CLIENT_ID` | Kakao Developers REST API Key |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth Client Secret. 클라이언트 노출 금지 |

**Kakao Redirect URI 등록 기준:**

```txt
로컬:
http://localhost:3030/api/auth/callback/kakao

Vercel Production:
https://[프로덕션도메인]/api/auth/callback/kakao

Vercel Preview (필요 시):
Preview URL 기준으로 별도 등록
```

Redirect URI는 Kakao Developers > 앱 > 카카오 로그인 > Redirect URI에서 등록한다.

---

## 9. Gemini 환경변수

| 키 | 용도 |
|----|------|
| `GEMINI_API_KEY` | Google Gemini API 호출용 key |

```txt
- 서버 API Route에서만 사용한다.
- 클라이언트 코드에서 노출 금지.
- NEXT_PUBLIC_ prefix 사용 금지.
```

---

## 10. Security 환경변수

| 키 | 용도 |
|----|------|
| `ROOM_TOKEN_SECRET` | 초대 링크 토큰 생성/검증 및 hash 처리에 사용하는 서버 전용 secret |
| `CRON_SECRET` | Vercel Cron 또는 서버 cron API 보호용 secret |

---

## 11. 팀원 로컬 환경 세팅 방식

현재 프로젝트는 Vercel Team을 사용하지 않으므로, 팀원이 `vercel env pull`을 직접 사용하기 어렵다.

**권장 방식:**

```txt
1. 배포 담당자 또는 PM이 .env.example 기준으로 각 key의 실제 값을 별도 채널로 전달한다.
   (단, 전달 방식은 보안 채널을 사용하며 PR, GitHub, 공개 문서에 작성하지 않는다.)

2. 팀원은 전달받은 값을 바탕으로 로컬에 .env.local 파일을 직접 생성한다.

3. .env.local은 Git에 커밋하지 않는다.
```

**.env.local 작성 기준:**

```txt
.env.example의 key를 기준으로 값을 채워 넣는다.
NEXT_PUBLIC_ prefix 없는 key는 서버 전용으로 취급한다.
SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, KAKAO_CLIENT_SECRET, NEXTAUTH_SECRET, ROOM_TOKEN_SECRET, CRON_SECRET는 클라이언트에 노출하지 않는다.
```

---

## 12. 금지 사항

```txt
- 실제 secret 값을 메신저, PR, 코드, 문서에 포함 금지
- .env.local을 Git에 커밋 금지
- .env.local을 Claude Code가 생성/읽는 것 금지
- NEXT_PUBLIC_ prefix를 secret key에 사용 금지
- SUPABASE_SERVICE_ROLE_KEY를 클라이언트 코드에서 사용 금지
- GEMINI_API_KEY를 클라이언트 코드에서 사용 금지
- KAKAO_CLIENT_SECRET를 클라이언트 코드에서 사용 금지
- VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID를 .env.example에 포함 금지
- 환경변수 값을 GitHub Issues, PR, Notion에 작성 금지
```

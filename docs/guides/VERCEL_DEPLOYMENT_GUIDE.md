# VERCEL_DEPLOYMENT_GUIDE.md

Vercel 배포 운영 가이드

---

## 1. 문서 목적

이 문서는 TALKY-OWL 프로젝트의 Vercel 배포 전략과 환경변수 운영 기준을 정의한다.

```txt
- 이 문서는 배포 전략과 환경변수 운영 기준 문서이다.
- 실제 GitHub Actions workflow 파일은 별도 작업에서 생성한다.
- 실제 Vercel 프로젝트 생성은 사람이 직접 한다.
- 실제 Vercel Environment Variables 등록은 사람이 직접 한다.
```

---

## 2. 운영 방식 요약

```txt
GitHub Organization repo
→ dev 브랜치 PR 병합
→ GitHub Actions에서 Vercel CLI 배포
→ 개인 Vercel Hobby 프로젝트로 배포
```

---

## 3. Vercel Hobby 단일 배포 계정 운영 기준

```txt
- Vercel Team은 사용하지 않는다.
- 배포 전용 Google 계정 1개로 Vercel Hobby 프로젝트를 운영한다.
- 팀원은 Vercel Team에 초대하지 않는다.
- 팀원은 GitHub PR 중심으로 작업한다.
- Vercel 환경변수 등록/수정은 배포 담당자 또는 PM이 수행한다.
```

이유:

```txt
Vercel Team은 유료 플랜이다.
GitHub Organization repo와 Vercel Hobby를 연결하려면 GitHub Actions + Vercel CLI 방식으로 배포한다.
팀원은 Vercel 접근 없이 GitHub PR 흐름으로만 협업한다.
```

---

## 4. GitHub Organization repo와 Vercel 배포 구조

```txt
GitHub Organization (I5-Project/TALKY-OWL)
  └─ dev 브랜치
       └─ PR 병합 트리거
            └─ GitHub Actions
                 └─ Vercel CLI (vercel --prod)
                      └─ 개인 Vercel Hobby 프로젝트
```

GitHub Actions가 Vercel CLI를 통해 배포를 수행하므로, 팀원은 Vercel 계정이 없어도 된다.

---

## 5. GitHub Actions + Vercel CLI 배포 개념

배포 흐름 (개념):

```txt
1. dev 브랜치에 PR 병합
2. GitHub Actions workflow 트리거
3. workflow 내에서 vercel CLI를 사용하여 배포
4. 배포 결과를 GitHub Actions 로그에서 확인
```

필요한 GitHub Actions Secrets:

```txt
VERCEL_TOKEN       Vercel Personal Access Token
VERCEL_ORG_ID      Vercel 프로젝트의 orgId
VERCEL_PROJECT_ID  Vercel 프로젝트 ID
```

주의:

```txt
- 실제 GitHub Actions workflow 파일은 이 문서에서 생성하지 않는다.
- workflow 생성은 별도 작업 브랜치에서 진행한다.
```

---

## 6. Vercel Environment Variables 등록 기준

배포 담당자 또는 PM이 Vercel Dashboard에서 직접 등록한다.

등록 경로:

```txt
Vercel Dashboard > 프로젝트 선택 > Settings > Environment Variables
```

등록할 key 목록 (실제 값은 작성하지 않음):

```env
DATABASE_URL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET_RESULT_CARDS=

NEXTAUTH_URL=
NEXTAUTH_SECRET=

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

GEMINI_API_KEY=

ROOM_TOKEN_SECRET=
CRON_SECRET=

NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_NAME=
```

환경 구분:

```txt
Production  → 프로덕션 배포용
Preview     → PR Preview 배포용 (필요 시)
Development → 개발 환경용 (필요 시)
```

---

## 7. GitHub Actions Secrets 등록 기준

배포 담당자가 GitHub Repository Settings에서 직접 등록한다.

등록 경로:

```txt
GitHub Repository > Settings > Secrets and variables > Actions
```

등록할 Secrets (실제 값은 작성하지 않음):

```txt
VERCEL_TOKEN       Vercel Personal Access Token
VERCEL_ORG_ID      Vercel 프로젝트 orgId
VERCEL_PROJECT_ID  Vercel 프로젝트 ID
```

VERCEL_TOKEN 발급 경로:

```txt
Vercel Dashboard > 계정 Settings > Tokens > Create Token
```

VERCEL_ORG_ID / VERCEL_PROJECT_ID 확인 방법:

```txt
vercel link 실행 후 생성되는 .vercel/project.json 파일에서 확인
```

주의:

```txt
- 위 Secrets는 .env.example에 포함하지 않는다.
- 실제 값을 문서, PR, 메신저에 작성하지 않는다.
```

---

## 8. 팀원 로컬 환경변수 관리

현재 프로젝트는 Vercel Team을 사용하지 않으므로, 팀원이 `vercel env pull`을 직접 사용하기 어렵다.

**권장 방식:**

```txt
1. 배포 담당자 또는 PM이 .env.example 기준으로 각 key의 값을 보안 채널로 전달한다.
2. 팀원은 전달받은 값을 바탕으로 로컬에 .env.local 파일을 직접 생성한다.
3. .env.local은 Git에 커밋하지 않는다.
4. 전달 과정에서 GitHub, Notion, PR, 공개 메신저에 secret 값을 작성하지 않는다.
```

---

## 9. Supabase 환경변수 등록 기준

Supabase 프로젝트 생성 후 아래 값을 확인하여 Vercel에 등록한다.

| 키 | 확인 경로 |
|----|----------|
| `DATABASE_URL` | Supabase Dashboard > Project Settings > Database > Connection String (URI 형식) |
| `SUPABASE_URL` | Supabase Dashboard > Project Settings > API > Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API > anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API > service_role key |
| `SUPABASE_STORAGE_BUCKET_RESULT_CARDS` | 생성한 bucket 이름. 권장: `result-cards` |

Supabase bucket 생성:

```txt
Supabase Dashboard > Storage > New bucket
bucket 이름: result-cards
```

---

## 10. Kakao OAuth Redirect URI 관리 기준

Kakao Developers에서 Redirect URI를 등록해야 한다.

등록 경로:

```txt
Kakao Developers > 앱 선택 > 카카오 로그인 > Redirect URI
```

등록할 URI:

```txt
로컬:
http://localhost:3030/api/auth/callback/kakao

Vercel Production:
https://[프로덕션도메인]/api/auth/callback/kakao

Vercel Preview (필요 시):
Preview URL 기준으로 별도 등록
```

프로덕션 도메인이 확정되면 위 플레이스홀더를 실제 도메인으로 변경한다.

---

## 11. Gemini API Key 관리 기준

```txt
- Google AI Studio 또는 Google Cloud Console에서 발급한다.
- 서버 API Route에서만 사용한다.
- NEXT_PUBLIC_ prefix를 절대 사용하지 않는다.
- 클라이언트 코드에서 노출하지 않는다.
```

---

## 12. 배포 전 체크리스트

```txt
- [ ] Vercel Environment Variables 모두 등록
- [ ] GitHub Actions Secrets 모두 등록
- [ ] Supabase result-cards bucket 생성
- [ ] Kakao Redirect URI 등록
- [ ] .env.example key와 Vercel 등록 key 일치 여부 확인
- [ ] SUPABASE_SERVICE_ROLE_KEY가 클라이언트 코드에 노출되지 않음 확인
- [ ] GEMINI_API_KEY가 클라이언트 코드에 노출되지 않음 확인
- [ ] npm run build 로컬 성공 확인
- [ ] npm run lint 통과 확인
- [ ] npm run type-check 통과 확인
```

---

## 13. 보안 주의사항

```txt
- 실제 secret 값을 GitHub, Notion, PR, 메신저, 문서에 작성하지 않는다.
- SUPABASE_SERVICE_ROLE_KEY는 서버 전용이며 클라이언트에 절대 노출하지 않는다.
- VERCEL_TOKEN은 GitHub Actions Secrets에만 등록하며 다른 곳에 공유하지 않는다.
- .env.local을 Git에 커밋하지 않는다.
- Kakao Client Secret은 클라이언트 코드에 포함하지 않는다.
- Gemini API Key는 클라이언트 코드에 포함하지 않는다.
```

# ENV_GUIDE.md

환경변수 운영 가이드

---

## 1. 환경변수 운영 원칙

```txt
.env.local은 팀 내부에서 공유하지 않는다.
.env.local은 Git에 커밋하지 않는다.
실제 secret 값을 메신저, PR, 코드에 포함하지 않는다.
```

---

## 2. Vercel env pull 방식

PM이 Vercel 프로젝트에 환경변수를 등록한다.
팀원은 아래 명령어로 로컬에 가져온다.

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트 연결
vercel link

# 환경변수 로컬에 pull
vercel env pull .env.local
```

---

## 3. .env.example 관리 기준

`.env.example`은 Git에 포함한다.
실제 값 없이 key 이름만 관리한다.

```txt
새로운 환경변수 추가 시:
1. .env.example에 key만 추가
2. Vercel에 실제 값 등록
3. PR에 .env.example 변경사항 포함
```

---

## 4. 주요 환경변수 목록

`/.env.example` 파일을 참고하세요.

```txt
NEXT_PUBLIC_APP_URL                   앱 URL
NEXTAUTH_URL                          NextAuth 콜백 URL
NEXTAUTH_SECRET                       NextAuth 서명 키
KAKAO_CLIENT_ID                       카카오 OAuth 앱 키
KAKAO_CLIENT_SECRET                   카카오 OAuth 시크릿
DATABASE_URL                          Supabase Postgres 연결 URL (Prisma 연결에 사용)
GEMINI_API_KEY                        Google Gemini API 키
ROOM_TOKEN_SECRET                     초대 링크 토큰 서명 키
CRON_SECRET                           Cron API 보호 키
SUPABASE_URL                          Supabase 프로젝트 URL
SUPABASE_ANON_KEY                     Supabase 공개 익명 키
SUPABASE_SERVICE_ROLE_KEY             Supabase 서버 전용 관리 키 (클라이언트 노출 금지)
SUPABASE_STORAGE_BUCKET_RESULT_CARDS  결과 카드 이미지 저장용 버킷 이름
```

---

## 5. Supabase 환경변수 주의사항

```txt
SUPABASE_SERVICE_ROLE_KEY는 서버 전용이다.
클라이언트(브라우저) 코드에서 SUPABASE_SERVICE_ROLE_KEY를 절대 사용하지 않는다.
NEXT_PUBLIC_ prefix를 SUPABASE_SERVICE_ROLE_KEY에 사용하지 않는다.
업로드, 삭제, 비공개 파일 접근은 반드시 Next.js API Route를 통해 서버에서 처리한다.
```

---

## 6. 금지사항

```txt
메신저(카카오톡, Slack 등)로 secret 값 공유 금지
GitHub PR / 코드에 실제 값 포함 금지
.env.local을 Git에 커밋 금지
NEXT_PUBLIC_ prefix 환경변수에 secret 값 사용 금지
```

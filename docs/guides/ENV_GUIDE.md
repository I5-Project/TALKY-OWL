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
NEXT_PUBLIC_APP_URL    앱 URL
NEXTAUTH_URL           NextAuth 콜백 URL
NEXTAUTH_SECRET        NextAuth 서명 키
KAKAO_CLIENT_ID        카카오 OAuth 앱 키
KAKAO_CLIENT_SECRET    카카오 OAuth 시크릿
DATABASE_URL           PostgreSQL 연결 URL
GEMINI_API_KEY         Google Gemini API 키
ROOM_TOKEN_SECRET      초대 링크 토큰 서명 키
CRON_SECRET            Cron API 보호 키
```

---

## 5. 금지사항

```txt
메신저(카카오톡, Slack 등)로 secret 값 공유 금지
GitHub PR / 코드에 실제 값 포함 금지
.env.local을 Git에 커밋 금지
NEXT_PUBLIC_ prefix 환경변수에 secret 값 사용 금지
```

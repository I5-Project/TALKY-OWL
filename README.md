# TALKY-OWL

AI 갈등 조정 판결 서비스

## 기술 스택

- Next.js 15, React 19, TypeScript
- Prisma + PostgreSQL
- Google Gemini API
- NextAuth (Kakao OAuth)
- Zustand, TanStack Query, React Hook Form, Zod
- SCSS Module, Recharts, html-to-image

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (port 3030)
npm run dev

# Mock 서버 실행 (port 8081)
npm run mock
```

## 환경변수

`.env.example`을 참고하세요.

실제 `.env.local`은 팀 내부에서 공유하지 않습니다.
Vercel에 등록된 환경변수를 아래 명령어로 로컬에 가져올 수 있습니다.

```bash
vercel env pull .env.local
```

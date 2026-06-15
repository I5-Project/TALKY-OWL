# 말해부엉

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

환경변수 key는 `.env.example`을 기준으로 확인합니다.

실제 값은 Git에 커밋하지 않습니다.

배포 환경변수는 Vercel Dashboard의 Project Settings > Environment Variables에서 관리합니다.

GitHub Actions로 Vercel CLI 배포를 사용하는 경우, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`는 GitHub Repository Secrets에 등록합니다.

`.env.local`은 로컬에서만 사용하며 Git에 포함하지 않습니다.

상세 내용은 [`docs/guides/ENV_GUIDE.md`](docs/guides/ENV_GUIDE.md) 및 [`docs/guides/VERCEL_DEPLOYMENT_GUIDE.md`](docs/guides/VERCEL_DEPLOYMENT_GUIDE.md)를 참고하세요.

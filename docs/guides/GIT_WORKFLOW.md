# GIT_WORKFLOW.md

Git 작업 흐름 가이드

---

## 1. 기본 브랜치

| 브랜치 | 용도 |
|--------|------|
| `main` | 최종 배포 브랜치 — 직접 push 금지 |
| `dev` | 개발 통합 브랜치 — 직접 push 금지 |

---

## 2. 작업 브랜치 종류

모든 작업 브랜치는 `dev`에서 분기한다.

| 브랜치 | 용도 |
|--------|------|
| `feature/*` | 새 기능 |
| `fix/*` | 버그 수정 |
| `refactor/*` | 리팩토링 |
| `docs/*` | 문서 작업 |
| `chore/*` | 패키지, 설정, 기타 |
| `infra/*` | 환경설정, 인프라 |
| `hotfix/*` | main 긴급 수정 후 dev 반영 |

예시:

```txt
feature/auth-kakao-login
feature/room-ai-chat-create-room
fix/judgement-duplicate-request
refactor/diary-query-optimization
docs/add-user-domain-spec
chore/setup-github-templates
infra/setup-eslint-config
```

---

## 3. 기본 작업 흐름

```txt
Issue 생성
→ dev 최신화
→ 작업 브랜치 생성
→ 작업
→ 검증 (lint / type-check)
→ PR 생성 (대상: dev)
→ 리뷰 및 수정
→ Squash Merge
→ Issue 자동 종료
```

---

## 4. 작업 시작 명령어 예시

```bash
# 1. dev 최신화
git checkout dev
git pull origin dev

# 2. 작업 브랜치 생성
git checkout -b feature/room-ai-chat-create-room

# 3. 작업 후 검증
npm run lint
npm run type-check

# 4. 커밋
git add [파일명]
git commit -m "feat: 방 생성 API 추가"

# 5. push
git push -u origin feature/room-ai-chat-create-room

# 6. GitHub에서 PR 생성 → base: dev
```

---

## 5. 커밋 메시지 규칙

```txt
feat:     새 기능 추가
fix:      버그 수정
docs:     문서 변경
style:    디자인 토큰, 전역 스타일, CSS 변경
refactor: 리팩토링
chore:    패키지, 설정, 기타
infra:    환경설정, 인프라
```

예시:

```txt
feat: 카카오 OAuth 로그인 구현
fix: 초대 토큰 만료 검증 수정
docs: Supabase 인프라 사용 확정 반영
style: 디자인 토큰 및 전역 스타일 설정
chore: 협업 템플릿 및 정책 추가
```

---

## 6. Conflict 해결 절차

```bash
# 1. dev 최신화
git checkout dev
git pull origin dev

# 2. 작업 브랜치로 이동 후 dev merge
git checkout feature/my-branch
git merge dev

# 3. 충돌 파일 수동 해결

# 4. 해결 후 커밋
git add [해결된 파일]
git commit -m "chore: dev 브랜치 충돌 해결"

# 5. push
git push origin feature/my-branch
```

---

## 7. 금지 사항

```txt
- main 직접 push 금지
- dev 직접 push 금지
- 커밋에 .env.local 포함 금지
- 커밋에 실제 secret 값 포함 금지
- 커밋에 SUPABASE_SERVICE_ROLE_KEY 실제 값 포함 금지
- git push --force 금지 (팀 공유 브랜치 대상)
- 브랜치 없이 직접 작업 금지
```

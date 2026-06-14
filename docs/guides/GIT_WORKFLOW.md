# GIT_WORKFLOW.md

Git 작업 흐름 가이드

---

## 1. 기본 브랜치

| 브랜치 | 용도 |
|--------|------|
| `main` | 최종 배포 브랜치 — 직접 push 금지 |
| `dev` | 개발 통합 브랜치 — 직접 push 금지 |

---

## 2. 작업 브랜치 네이밍

모든 작업 브랜치는 `dev`에서 분기한다.

```txt
feature/*    새 기능
fix/*        버그 수정
refactor/*   리팩토링
docs/*       문서 작업
infra/*      환경설정, 인프라
```

예시:

```txt
feature/auth-kakao-login
fix/room-token-validation
docs/add-domain-template
infra/setup-eslint
```

---

## 3. 작업 흐름

```bash
# 1. dev 최신화
git checkout dev
git pull origin dev

# 2. 작업 브랜치 생성
git checkout -b feature/example

# 3. 작업 후 검증
npm run lint
npm run type-check

# 4. 커밋
git add [파일명]
git commit -m "feat: 작업 내용 요약"

# 5. push
git push -u origin feature/example

# 6. GitHub에서 PR 생성 → dev 대상
```

---

## 4. 커밋 메시지 규칙

```txt
feat:     새 기능
fix:      버그 수정
docs:     문서 변경
refactor: 리팩토링
infra:    환경설정, 인프라
chore:    기타 (패키지, 설정 등)
```

---

## 5. 금지사항

```txt
main 직접 push 금지
dev 직접 push 금지
커밋에 .env.local 포함 금지
커밋에 실제 secret 값 포함 금지
```

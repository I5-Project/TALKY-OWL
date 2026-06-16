# GitHub 협업 정책

TALKY-OWL 프로젝트 GitHub 협업 정책 문서

---

## 1. 문서 목적

이 문서는 TALKY-OWL 팀의 GitHub 협업 기준을 정의한다.
모든 팀원은 이 문서를 숙지하고 작업 전에 참고한다.

---

## 2. Repository 운영 원칙

```txt
Repository: https://github.com/I5-Project/TALKY-OWL
기본 브랜치: main (최종 배포), dev (개발 통합)
PR 대상: 기본 dev
main 직접 push 금지
dev 직접 push 금지
```

모든 작업은 작업 브랜치 생성 → PR → 리뷰 → Merge 순서로 진행한다.

---

---

## 6. Branch 전략

```txt
main  ← 최종 배포 브랜치 (직접 push 금지)
 └─ dev  ← 개발 통합 브랜치 (직접 push 금지)
       ├─ feature/*
       ├─ fix/*
       ├─ refactor/*
       ├─ docs/*
       ├─ chore/*
       └─ infra/*
```

hotfix는 `main`에 직접 PR 후 `dev`에도 반영한다.

```txt
hotfix/* → main → dev 반영
```

---

## 7. Branch Naming Convention

```txt
feature/{작업영역}-{내용}
fix/{작업영역}-{내용}
refactor/{작업영역}-{내용}
docs/{내용}
chore/{내용}
infra/{내용}
hotfix/{내용}
```

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

### GitHub Ruleset — 브랜치명 강제 적용 규칙

브랜치 생성 시 아래 규칙이 적용된다. 통과해야 push 가능하다.

**Must match a given regex pattern**

```
^(main|dev|feature\/[a-z0-9]+(-[a-z0-9]+)*|fix\/[a-z0-9]+(-[a-z0-9]+)*|refactor\/[a-z0-9]+(-[a-z0-9]+)*|docs\/[a-z0-9]+(-[a-z0-9]+)*|chore\/[a-z0-9]+(-[a-z0-9]+)*|infra\/[a-z0-9]+(-[a-z0-9]+)*|hotfix\/[a-z0-9]+(-[a-z0-9]+)*)$
```

**적용 기준**

```txt
- 허용 prefix: feature / fix / refactor / docs / chore / infra / hotfix
- / 이후: 소문자 영문(a-z) + 숫자(0-9) + 하이픈(-) 만 허용
- 대문자, 언더스코어(_), 한글, 점(.) 사용 불가
- 형식: prefix/word(-word)* — 각 word는 [a-z0-9]+ 조합
```

**유효 예시**

```txt
feature/common-component-jw   ✅
feature/auth-kakao-login       ✅
fix/judgement-duplicate        ✅
docs/add-user-domain-spec      ✅
```

**무효 예시**

```txt
feature/auth_kakao             ❌  언더스코어 불가
feature/Auth-Login             ❌  대문자 불가
feature/공통-컴포넌트           ❌  한글 불가
```

> PR 제목 규칙(한글 허용 여부 포함)은 `docs/guides/PR_RULES.md` 참고.

---

## 8. Commit Message Convention

```txt
feat:     새 기능 추가
fix:      버그 수정
docs:     문서 변경
refactor: 리팩토링
chore:    패키지, 설정, 기타
infra:    환경설정, 인프라
```

예시:

```txt
feat(auth): add kakao oauth login
fix(room): resolve token expiry validation
docs(infra): confirm Supabase as project infrastructure
chore(github): add collaboration templates and policy
```

---

## 9. Pull Request 정책

```txt
- 작업 완료 후 dev를 대상으로 PR을 생성한다.
- PR 제목은 [Feat], [Fix], [Docs], [Chore], [Refactor], [Infra] prefix를 붙인다.
- PR Template을 반드시 작성한다.
- 리뷰어를 1명 이상 지정한다.
- 셀프 Merge 금지 (긴급 hotfix 제외).
```

---

---

## 11. Code Review 정책

```txt
- 리뷰어는 기능 범위, 문서 기준, 폴더 구조, 보안, 환경변수를 확인한다.
- 리뷰 승인(Approve) 1명 이상 필요.
- Request Changes가 있으면 수정 후 재요청한다.
- 코드 스타일 지적은 Nit: 접두사를 사용한다.
```

리뷰 체크 항목:

```txt
기능 범위:   MVP 외 기능 구현 여부 확인
문서 기준:   CLAUDE.md / 도메인 문서와 일치 여부
폴더 구조:   features 폴더, 금지 구조 사용 여부
보안:        권한 검증 서버 수행 여부, 민감 정보 노출 여부
환경변수:    .env.local, secret 값 커밋 여부
상태 전이:   임의 상태 점프 여부
Supabase:   Service Role Key 클라이언트 노출 여부
```

---

## 12. Merge 정책

```txt
Merge 방식: Squash Merge 권장
이유: 작업 브랜치의 커밋 이력을 하나로 합쳐 dev 히스토리를 간결하게 유지
```

Squash Merge 기본 설정은 GitHub Settings > General > Pull Requests에서 직접 설정한다.

Merge 조건:

```txt
- 리뷰 승인 1명 이상
- 충돌(Conflict) 없음
- 빌드 성공 (로컬 확인)
- 환경변수 노출 없음
```

---

## 13. Branch Protection 정책

GitHub Settings > Branches에서 아래 설정을 직접 적용한다.

### main 보호 규칙

```txt
- Require a pull request before merging: ON
- Require approvals: 1명 이상
- Dismiss stale pull request approvals: ON
- Require status checks to pass: 필요 시 설정
- Include administrators: ON
```

### dev 보호 규칙

```txt
- Require a pull request before merging: ON
- Require approvals: 1명 이상
- Include administrators: ON
```

---

## 14. Conflict 해결 정책

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
git commit -m "chore: resolve merge conflict with dev"

# 5. push
git push origin feature/my-branch
```

---

## 15. DB 변경 정책

```txt
- Prisma schema 변경은 반드시 팀 승인 후 진행한다.
- ERD 문서가 먼저 업데이트되어야 Prisma schema 변경이 가능하다.
- Migration 파일은 반드시 PR에 포함한다.
- DB relation 변경은 CLAUDE.md 15항 기준으로 승인 필요.
```

---

## 16. API 변경 정책

```txt
- API endpoint 추가 / 삭제 / 구조 변경은 반드시 팀 승인 후 진행한다.
- API_SPEC.md 문서를 먼저 업데이트한 후 구현한다.
- API 응답 구조 변경은 CLAUDE.md 15항 기준으로 승인 필요.
```

---

## 17. 환경변수 / 보안 정책

### 운영 원칙

```txt
- 실제 secret 값을 코드, PR, 메신저에 포함하지 않는다.
- .env.local은 Git에 커밋하지 않는다.
- NEXT_PUBLIC_ prefix에 secret 값 사용 금지.
```

### 환경변수 동기화

PM이 Vercel에 등록. 팀원은 아래 명령어로 동기화한다.

```bash
vercel env pull .env.local
```

### Supabase 보안 원칙

```txt
- Supabase는 실제 사용 인프라로 확정.
- DB는 Supabase Postgres 사용. Prisma는 DATABASE_URL로 연결.
- Storage는 Supabase Storage 사용. MVP 범위는 result-cards bucket.
- Supabase Auth는 사용하지 않음. 인증은 NextAuth + Kakao OAuth 유지.
- SUPABASE_SERVICE_ROLE_KEY는 서버 전용. 클라이언트 노출 절대 금지.
- 업로드 / 삭제 / 비공개 파일 접근은 Next.js API Route를 통해 서버에서 처리.
```

### 환경변수 목록 (key만 참고)

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
```

---

## 18. Package 관리 정책

```txt
- 패키지 추가는 반드시 팀 공유 후 진행한다.
- package-lock.json은 Git에 포함한다.
- 팀원은 신규 패키지 포함 PR 병합 후 npm ci로 설치한다.
- MVP에서 @supabase/supabase-js 설치는 Storage/DB 유틸 구현 브랜치에서 별도 진행한다.
```

---

## 19. UI / Design 변경 정책

```txt
- 공통 컴포넌트 변경 시 반드시 팀에 공유한다.
- 도메인 전용 컴포넌트는 담당자가 직접 구현한다.
- SCSS Module 기준으로 스타일링한다. (전역 스타일은 src/styles/)
- public/images는 정적 에셋 관리용으로 유지한다.
```

---

## 20. AI / Prompt 변경 정책

```txt
- Gemini API 프롬프트 구조 변경은 반드시 팀 승인 후 진행한다.
- AI 판결 결과 항목 변경은 CLAUDE.md 기준에서 벗어나지 않는다.
- A/B 공감 지수 / 소통 태도 점수 구현 절대 금지.
```

---

## 21. 테스트 / 확인 정책

```txt
PR 전 로컬 확인 필수:
npm run lint
npm run type-check
npm run build (가능하면)

빌드 에러가 있으면 PR 생성 전에 해결한다.
```

---

## 22. 문서 관리 정책

```txt
- 도메인 상세 설계는 docs/domains/*.md에서 관리한다.
- 프로젝트 최종 결정사항은 docs/PROJECT_DECISIONS.md에 반영한다.
- 기술스택은 docs/TECH_STACK.md에서 관리한다.
- 협업 정책 변경 시 이 문서의 변경 이력을 업데이트한다.
```

---

## 23. 금지 사항

```txt
- main 직접 push 금지
- dev 직접 push 금지
- 셀프 Merge 금지 (긴급 hotfix 제외)
- .env.local Git 커밋 금지
- 실제 secret 값 코드/PR/메신저 노출 금지
- SUPABASE_SERVICE_ROLE_KEY 클라이언트 코드 사용 금지
- @supabase/supabase-js 무단 설치 금지
- src/features 폴더 사용 금지
- MVP 제외 기능 구현 금지 (shop, points, user-items, 독립 statistics 화면 등)
- Prisma schema 무단 변경 금지
- API endpoint 무단 변경 금지
- 결과 유형 Enum 하드코딩 금지
- 감정일기 원문 / 진술 원문 공유 이미지 / Storage 저장 금지
- GitHub Actions workflow 무단 추가 금지
```

---

## 24. 최종 체크리스트

PR 생성 전 아래 항목을 확인한다.

```txt
- [ ] 브랜치가 dev 기준으로 생성됨
- [ ] PR 제목에 prefix 포함
- [ ] PR Template 모든 항목 작성
- [ ] lint / type-check 통과
- [ ] 빌드 에러 없음
- [ ] .env.local 미포함
- [ ] 실제 secret 값 미포함
- [ ] SUPABASE_SERVICE_ROLE_KEY 클라이언트 미노출
- [ ] MVP 범위 내 작업
- [ ] 리뷰어 지정
```

---

## 25. 변경 이력

| 날짜 | 작성자 | 내용 |
|------|--------|------|
| 2026-06-15 | - | 최초 작성 (dev 브랜치 기준, Supabase 인프라 확정 반영) |

# PR_RULES.md

Pull Request 규칙 가이드

---

## 1. PR 대상 브랜치

```txt
기본 대상: dev
hotfix 대상: main (병합 후 dev 반영 필수)
main 직접 병합은 최종 배포 시에만 진행
```

---

## 2. PR 제목 규칙

제목은 `[Prefix] 내용` 형식으로 작성한다.

| Prefix | 용도 |
|--------|------|
| `[Feat]` | 새 기능 추가 |
| `[Fix]` | 버그 수정 |
| `[Docs]` | 문서 작업 |
| `[Infra]` | 환경설정, 인프라 |
| `[Refactor]` | 리팩토링 |
| `[Chore]` | 패키지, 설정, 기타 |

예시:

```txt
[Feat] 카카오 로그인 구현
[Fix] 초대 링크 만료 검증 수정
[Docs] Supabase 인프라 사용 확정 반영
[Chore] GitHub 협업 템플릿 추가
```

### GitHub Ruleset — PR 제목 강제 적용 규칙

PR 생성 시 아래 규칙이 적용된다.

**Must start with a matching pattern**

```
^(feature|fix|hotfix|chore|docs|refactor|test)/[A-Za-z0-9가-힣._-]+
```

**적용 기준**

```txt
- 허용 prefix: feature / fix / hotfix / chore / docs / refactor / test
- / 이후: 한글, 영문(대소문자), 숫자, 점(.), 언더스코어(_), 하이픈(-) 허용
- 브랜치명과 달리 한글 사용 가능
```

**유효 예시**

```txt
[Feat] 카카오 로그인 구현        ✅
[Fix] 초대 링크 만료 검증 수정   ✅
[Chore] GitHub 협업 템플릿 추가  ✅
```

---

## 3. PR 본문 필수 항목

PR Template(`.github/pull_request_template.md`)을 사용한다.

포함 항목:

```txt
1. 작업 내용
2. 담당 작업 영역 (체크박스)
3. 관련 기능 요구사항 (FR-)
4. 관련 비기능 요구사항 (NFR-)
5. 변경 사항
6. 테스트 결과 (체크박스)
7. 작업 범위 확인 (체크박스)
8. 보안 / 개인정보 확인 (체크박스)
9. DB / API / Storage 변경 여부 (체크박스)
10. 스크린샷 (필요 시)
11. 추가 공유 사항
```

---

## 4. PR 전 확인 사항

```bash
npm run lint        # ESLint 통과 확인
npm run type-check  # TypeScript 오류 없음 확인
npm run build       # 빌드 에러 없음 확인 (가능하면)
```

---

## 5. Merge 기준

```txt
- 리뷰 승인(Approve) 1명 이상
- 충돌(Conflict) 없음
- 빌드 성공 (로컬 확인)
- 환경변수 / secret 값 노출 없음
- SUPABASE_SERVICE_ROLE_KEY 클라이언트 노출 없음
```

Merge 방식은 Squash Merge를 권장한다.
GitHub Settings > General > Pull Requests에서 직접 설정한다.

---

## 6. 리뷰 체크 항목

```txt
기능 범위:   MVP 외 기능 구현 여부 확인
문서 기준:   CLAUDE.md / 도메인 문서와 일치 여부
폴더 구조:   src/features 폴더, 금지 구조 사용 여부
보안:        권한 검증 서버 수행 여부, 민감 정보 노출 여부
환경변수:    .env.local, secret 값 커밋 여부
Supabase:   Service Role Key 클라이언트 노출 여부
상태 전이:   CLAUDE.md 기준 임의 상태 점프 여부
DB / API:   무단 schema 변경, 무단 endpoint 추가 여부
```

---

## 7. 금지 사항

```txt
- 셀프 Merge 금지 (긴급 hotfix 제외)
- 리뷰 없이 Merge 금지
- 빌드 에러 상태로 Merge 금지
- .env.local 포함 PR 금지
- 실제 secret 값 포함 PR 금지
- SUPABASE_SERVICE_ROLE_KEY 실제 값 PR 포함 금지
- MVP 제외 기능 포함 PR 금지 (shop, points, user-items 등)
- Prisma schema 무단 변경 포함 PR 금지
- API endpoint 무단 변경 포함 PR 금지
- 리뷰어 미지정 Merge 금지
```

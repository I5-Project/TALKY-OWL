# PR_RULES.md

Pull Request 규칙 가이드

---

## 1. PR 대상

기본 대상 브랜치는 `dev`.
`main` 병합은 최종 배포 시에만 진행한다.

---

## 2. PR 전 확인

```txt
npm run lint       — ESLint 통과
npm run type-check — TypeScript 오류 없음
변경 범위 확인     — 의도하지 않은 파일 포함 여부
.env.local 미포함  — 환경변수 파일 커밋 여부
```

---

## 3. PR 제목 규칙

```txt
feat:     새 기능 추가
fix:      버그 수정
docs:     문서 작업
infra:    환경설정, 인프라
refactor: 리팩토링
chore:    패키지, 기타
```

예시:

```txt
feat: add kakao oauth login flow
fix: resolve room token expiry validation
docs: add dispute domain template
```

---

## 4. PR 설명에 포함할 내용

```txt
## Summary
- 작업 목적
- 변경 파일 목록

## 검증
- lint / type-check 결과
- 기능 확인 결과

## 주의사항
- 리뷰어가 알아야 할 사항
```

---

## 5. 리뷰 기준

```txt
기능 범위: MVP 외 기능 구현 여부
문서 기준: CLAUDE.md / 도메인 문서와의 일치 여부
폴더 구조: features 폴더, 금지 구조 사용 여부
보안: 권한 검증 서버 수행 여부, 민감 정보 노출 여부
환경변수: .env.local, secret 값 커밋 여부
상태 전이: 임의 상태 점프 여부
```

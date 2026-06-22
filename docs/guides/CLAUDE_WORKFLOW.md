# CLAUDE_WORKFLOW.md

Claude Code 작업 절차 가이드

> 기준 문서: `CLAUDE.md` (섹션 13–15)

---

## 1. 기본 작업 절차

```txt
1. 관련 문서 확인
   CLAUDE.md / PROJECT_DECISIONS.md / 해당 도메인 docs/domains/*.md

2. 작업 계획 제시
   변경 파일 목록, 예상 범위, 주의사항 포함

3. 사용자 승인 대기
   계획 확인 전 구현 금지

4. 구현

5. 검증
   lint / type-check / 기능 확인

6. 변경 파일 요약

7. 커밋 / PR 안내
   PR 생성 시 .github/pull_request_template.md 양식 준수
   해당 없는 항목은 "해당 없음"으로 명시, 체크박스 유지
```

문서가 없거나 문서 간 충돌이 있으면 구현하지 말고 질문한다.

---

## 2. 작업 전 확인 문서

```txt
CLAUDE.md
docs/PROJECT_DECISIONS.md
docs/guides/GIT_WORKFLOW.md
docs/db/STATUS_TRANSITION.md
docs/domains/[해당 도메인].md
```

도메인 문서가 없으면 담당자에게 문서 작성을 요청한다.

---

## 3. STOP 조건

아래 상황에서 즉시 중단하고 사용자에게 확인한다.

```txt
ERD 없이 Prisma schema 변경이 필요한 경우
상태 전이 규칙 변경이 필요한 경우
권한 쿼리 변경이 필요한 경우
API 응답 구조 변경이 필요한 경우
MVP 제외 기능 구현 요청이 발생한 경우
shop / points / user-items 구현이 필요한 경우
6개 카테고리 기준 구현이 필요한 경우
공감 지수 / 소통 태도 점수 구현이 필요한 경우
AI 대화방 없이 바로 1:1 사건 생성 흐름이 필요한 경우
statistics 독립 화면 생성이 필요한 경우
결과 유형을 Enum으로 하드코딩하려는 경우
브랜치 없이 작업 중인 경우
도메인별 문서가 없는데 임의로 도메인 로직을 구현하려는 경우
```

---

## 4. 승인 필요 조건

아래 작업은 반드시 사용자 또는 팀 승인 후 진행한다.

```txt
Prisma schema 변경
DB relation 변경
상태 전이 규칙 변경
권한 검증 로직 변경
API endpoint 추가 / 삭제 / 구조 변경
카카오 OAuth 설정 변경
Gemini API 프롬프트 구조 변경
환경변수 추가 / 삭제
공통 폴더 구조 변경
MVP 제외 기능을 구현 범위로 올리는 작업
```

---

## 5. 금지사항

```txt
기능 범위 임의 확장
문서 간 충돌 무시하고 구현
브랜치 없이 작업
shop / points / user-items 구현 폴더 생성
features 폴더 생성
실제 환경변수 값 코드에 포함
```

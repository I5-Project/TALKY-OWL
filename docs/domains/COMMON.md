# COMMON Domain Document

> 작성자: TODO: 담당자 확인 필요
> 최종 수정일: 2026-06-15

---

## 1. 도메인 목적

앱 전반에서 공유하는 공통 기능을 담당한다.
에러 처리, 공통 응답 구조, 로그 기준, 삭제/비식별 처리, 네비게이션, 보안 유틸을 포함한다.

---

## 2. 담당자

```txt
FE: TODO: 담당자 확인 필요
BE: TODO: 담당자 확인 필요
```

---

## 3. 관련 기능 요구사항 ID

```txt
FR-COM-001
FR-COM-002
FR-COM-003
FR-COM-004
FR-COM-005
```

---

## 4. 관련 비기능 요구사항 ID

```txt
TODO: 비기능 요구사항 정의서 확인 후 작성
```

---

## 5. 포함 기능

```txt
- 뒤로가기
- 메인 이동
- 앱 내 배너 이동
- Footer 약관 링크
- 로그인 실패 및 returnUrl 처리
- 공통 에러 처리 (try-catch 기반)
- 공통 API 응답 구조
- 공통 로그 기준
- 삭제 / 비식별 처리
```

---

## 6. 제외 기능

```txt
- 도메인별 개별 비즈니스 로직
- Sentry 연동 (MVP 제외, Vercel Logs 기준 운영)
- 푸시 알림
```

---

## 7. 관련 화면

```txt
src/app/page/landing/
src/components/layout/
src/components/feedback/
```

---

## 8. 관련 API

```txt
공통 응답 구조는 모든 /api/v1/* 에 적용
```

상세 스펙은 `docs/API_SPEC.md` 확정 후 작성.

---

## 9. 관련 테이블

현재 Prisma schema 기준 로그 테이블:

```txt
audit_logs          공통 이벤트 감사 로그 (eventType + metadata Json)
api_error_logs      API 오류 로그
moderation_logs     욕설/혐오/민감표현 필터링 결과 로그
room_access_logs    초대 링크 접근 기록
user_deletion_logs  회원탈퇴 / 비식별 처리 이력 (User 삭제 후에도 유지)
```

> **TODO**: 구조 가이드 v2 section 17에 `judgement_logs` 테이블이 언급되어 있으나,
> 현재 Prisma schema MVP 초안(PR #21)에는 포함되지 않았다.
> AI 판결 요청/성공/실패 로그는 현재 `audit_logs` (eventType: JUDGMENT_CREATED)와
> `api_error_logs`로 처리한다.
> `judgement_logs` 별도 모델이 필요한 경우 Prisma schema 변경 승인 후 추가한다.

---

## 10. 상태 전이

공통 도메인에 별도 상태 전이 없음.

---

## 11. 권한 규칙

```txt
공통 에러 응답: 권한 없는 접근 시 401 / 403 반환
삭제/비식별 처리: 본인 또는 관리자 권한 기준 (추후 확정)
```

---

## 12. UI 연결 지점

```txt
공통 에러 처리:  src/lib/api/
공통 유틸:       src/lib/utils/
보안 유틸:       src/lib/security/
공통 레이아웃:   src/components/layout/
공통 피드백 UI:  src/components/feedback/
```

---

## 13. 예외 상황

```txt
- API 오류 시 공통 에러 응답 구조 반환
- DB 실패 시 로그 기록 (원문 포함 금지)
- 삭제/비식별 처리 중 오류 시 롤백 기준 확인 필요
```

---

## 14. Claude 작업 시 주의사항

```txt
- 민감 정보(사건 원문, 감정일기 원문, 개인정보)를 로그에 저장하지 않음
- 공통 로직을 도메인 내부에 중복 구현하지 않음
- 공통 폴더 구조 변경은 팀 승인 필요 (CLAUDE.md 15항 참고)
```
